var mysql = require('mysql');
var global = require('./global.js');
var config = require('../config.json');


function servePage(req,res,next)
{
	var connection = mysql.createConnection( config.database );
	connection.query(
		'SELECT name,concept,private,info FROM Characters WHERE BINARY owner = ? AND BINARY canonical_name = ?;',
		[req.params.user, req.params.char],
		function(err,rows,fields){
			if( err ){
				global.error( err, global.logLevels.warning );
				res.send(500);
			}
			else if( rows.length == 1 )
			{
				// authorized user
				if( !rows[0].private || req.params.user == req.session.user )
				{
					if( /printable$/.test(req.url) ){
						global.log('Serving printable character page for', req.url);
						global.renderPage('printable', {toonName: rows[0].name, toonConcept: rows[0].concept})(req,res);
					}
					else {
						global.log('Serving character page for', req.url);
						global.renderPage('charsheet/base', {toonName: rows[0].name, toonConcept: rows[0].concept})(req,res);
					}
				}
				// unauthorized
				else {
					global.log('Serving blocked character page');
					global.renderPage('private', {code: 401, toonName: rows[0].name, toonOwner: req.params.user})(req,res);
				}
			}
			else {
				next();
			}
			connection.end();
		}
	);
}

function serveJson(req,res,next)
{
	var connection = mysql.createConnection( config.database );
	connection.query(
		'SELECT info FROM Characters WHERE BINARY owner = ? AND BINARY canonical_name = ?;',
		[req.params.user, req.params.char],
		function(err,rows,fields){
			if( err ){
				global.error( err, global.logLevels.warning );
				res.send(500);
			}
			else if( rows.length == 1 ){
				global.log('Serving character JSON for', req.url);
				res.json(200, JSON.parse(rows[0].info));
			}
			else {
				next();
			}
			connection.end();
		}
	);
}

function pushJson(req,res,next)
{
	// don't update if incorrect user is logged in
	if( !(req.session && req.session.user && req.session.user == req.params.user) ){
		res.send(401);
		return;
	}

	global.log('Attempting to update character sheet of', req.params.char);
	//console.log( JSON.stringify(req.body.stress[0], null, 2) );
	//res.send(200);

	var connection = mysql.createConnection( config.database );
	connection.query(
		'UPDATE Characters SET info = ?, name = ?, concept = ?, last_updated = NOW() WHERE BINARY owner = ? AND BINARY canonical_name = ?;',
		[JSON.stringify(req.body), req.body.name, req.body.aspects.high_concept.name, req.params.user, req.params.char],
		function(err,result){
			if( !err ){
				global.log('Success');
				res.json(req.body);
			}
			else {
				global.error('MySQL error:', err, global.logLevels.error);
				res.send(500);
			}
			connection.end();
		}
	);
}

function newCharacterPage(req,res)
{
	if( !req.session.user ){
		res.send(401);
		return;
	}

	// get list of users/characters to use as templates
	var templates = [], users = [];
	for(var i=0; i<config.templates.length; i++)
	{
		if( /\//.test(config.templates[i]) )
			templates.push(config.templates[i]);
		else
			users.push(config.templates[i]);
	}

	global.log('Serving new character page');

	if( users.length > 0 )
	{
		var connection = mysql.createConnection( config.database );
		connection.query('SELECT CONCAT(owner,"/",canonical_name) AS slug FROM Characters WHERE BINARY owner IN (?) AND private = FALSE;', [users], function(err,rows,fields)
		{
			if(err){
				global.error('MySQL error while retrieving templates:', err);
				console.log(connection.escape(users));
				global.renderPage('newtoon')(req,res);
			}
			else
			{
				var userTemplates = rows.reduce(function(sum,cur){ sum.push(cur.slug); return sum; }, []);
				templates.push.apply(templates, userTemplates);
				templates.sort();
				global.renderPage('newtoon', {templates: templates})(req,res);
			}
			connection.end();
		});
	}
	else
	{
		templates.sort();
		global.renderPage('newtoon', {templates: templates})(req,res);
	}

}

function newCharacterRequest(req,res)
{
	if( !req.session || !req.session.user ){
		global.error('Anonymous character creation attempted!', global.logLevels.error);
		global.renderPage('newtoon', {code:401, message: {type: 'error', content: res.i18n.__('server.anonNewToon')}})(req,res);
		return;
	}
	else if( !(req.body && req.body.name && req.body.concept && req.body.canon_name) ){
		global.error('Incomplete character creation attempted', global.logLevels.error);
		global.renderPage('newtoon', {code:400, message: {type: 'error', content: res.i18n.__('server.incompleteForm')}})(req,res);
		return;
	}

	// create blank character JSON object
	var toon = {
		'name': req.body.name,
		'player': req.session.user,
		'aspects': {
			'high_concept': {'name': req.body.concept,'description': ''},
			'trouble': {'name': '', 'description': ''},
			'aspects': []},
		'stress': [{
			'name': 'Physical','skill': 'Endurance','toughness': 0, 'strength': 2, 'boxes':[], 'armor': []},{
			'name': 'Mental','skill': 'Conviction','toughness': 0,'strength': 2, 'boxes':[], 'armor': []},{
			'name': 'Social','skill': 'Presence','toughness': 0,'strength': 2, 'boxes':[], 'armor': []}],
		'consequences': [{
			'severity': 'Mild','mode': 'Any','used': false,'aspect': ''},{
			'severity': 'Moderate','mode': 'Any','used': false,'aspect': ''},{
			'severity': 'Severe','mode': 'Any','used': false,'aspect': ''},{
			'severity': 'Extreme','mode': 'Any','used': false,'aspect': 'Replace permanent'}],
		'totals': {
			'base_refresh': 10,'skill_cap': 5,'skills_total': 35,'fate_points': 0},
		'skills': {
			'lists': [[],[],[],[],[],[],[],[],[]],
			'shifted_lists': [[],[],[],[],[],[],[],[],[]],
			'is_shifter': false
		},
		'powers': [],
		'notes': {'text':'','enabled':false}
	};

	global.log('Attempting character creation');
	var connection = mysql.createConnection( config.database );

	if( req.body.template )
	{
		global.log('Attempting copy of', req.body.template);
		var parts = req.body.template.split('/');
		connection.query('SELECT info,avatar FROM Characters WHERE BINARY owner = ? AND BINARY canonical_name = ? AND (private = 0 OR BINARY owner = ?);',
			[parts[0], parts[1], req.session.user],
			function(err,rows,fields)
			{
				if(err){
					global.error('MySQL error:', err);
					global.renderPage('newtoon', {code:500, message: {type: 'error', content: res.i18n.__('server.genericErr')}})(req,res);
					connection.end();
				}
				else if(rows.length === 0){
					global.error('Cannot copy non-existent or private character');
					global.renderPage('newtoon', {code:400, message: {type: 'error', content: res.i18n.__('server.character404')}})(req,res);
					res.send(400);
					connection.end();
				}
				else {
					var info = JSON.parse(rows[0].info);
					info.name = req.body.name;
					info.player = req.session.user;
					info.aspects.high_concept = {name: req.body.concept, description: ''};
					addCharacter(info, rows[0].avatar);
				}
			}
		);
	}
	else {
		addCharacter(toon);
	}

	function addCharacter(info, avatar)
	{
		connection.query('INSERT INTO Characters SET created_on=NOW(), ?;',
			{'canonical_name': req.body.canon_name, 'name': req.body.name, 'owner': req.session.user,
				'concept': req.body.concept, 'info': JSON.stringify(info), 'avatar': avatar,
				'private': req.body.private==='on' ? true : false},
			function(err,rows,fields)
			{
				if( err ){
					global.error('MySQL error:', err);
					global.renderPage('newtoon', {code:400, message: {type: 'error', content: res.i18n.__('server.duplicateSlug')}})(req,res);
				}
				else {
					global.log('Creation successful');
					var url = '/'+req.session.user+'/'+req.body.canon_name+'/';
					res.redirect(url);
				}
				connection.end();
			}
		);
	}
}

function deleteCharacterPage(req,res)
{
	if( !(req.session && req.session.user) ){
		res.send(401);
		return;
	}

	var connection = mysql.createConnection(config.database);
	connection.query('SELECT name, concept FROM Characters WHERE BINARY owner = ? AND BINARY canonical_name = ?;',
		[req.session.user, req.query.id],
		function(err,rows,fields)
		{
			if( err ){
				global.error('MySQL error: ', err);
				global.renderPage('killtoon', {code: 500, message: {type: 'error', content: res.i18n.__('server.genericErr')}})(req,res);
			}
			else if( rows.length == 0 ){
				global.error('No such character: '+req.query.id);
				//global.renderPage('killtoon', {message: {type: 'error', content: 'Character id does not exist, cannot be deleted.'}})(req,res);
				req.session.latent_message = res.i18n.__('server.character404');
				res.redirect('/'+req.session.user);
			}
			else {
				global.renderPage('killtoon', {toon: {canon: req.query.id, name: rows[0].name, hc: rows[0].concept}})(req,res);
			}
			connection.end();	
		}
	);
}

function deleteCharacterRequest(req,res)
{
	// check if a user is logged in and passed the correct data
	if( !(req.session && req.session.user) ){
		res.send(401);
		return;
	}
	else if( !(req.body && req.body.charname) ){
		res.send(400);
		return;
	}

	global.log('Attempting character deletion:',req.body.charname);
	var connection = mysql.createConnection(config.database);
	connection.query('DELETE FROM Characters WHERE BINARY owner = ? AND BINARY canonical_name = ?;',
		[req.session.user, req.body.charname],
		function(err,info)
		{
			if(err){
				global.error('MySQL error:', err);
				global.renderPage('killtoon', {code: 500, message: {type: 'error', content: res.i18n.__('server.genericErr')}})(req,res);
			}
			else if(info.affectedRows == 0){
				global.log('No such character to delete');
				global.renderPage('killtoon', {code: 403, message: {type: 'error', content: res.i18n.__('server.character404')}})(req,res);
			}
			else {
				global.log('Character deleted');
				req.session.latent_message = res.i18n.__('server.charDeleted', req.body.charname);
				res.redirect('/'+req.session.user);
			}
			connection.end();
		}
	);
}

exports.servePage = servePage;
exports.serveJson = serveJson;
exports.pushJson = pushJson;

exports.newCharacterPage = newCharacterPage;
exports.newCharacterRequest = newCharacterRequest;

exports.deleteCharacterRequest = deleteCharacterRequest;
exports.deleteCharacterPage = deleteCharacterPage;

