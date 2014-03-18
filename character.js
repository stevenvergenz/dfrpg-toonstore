var mysql = require('mysql');
var libpath = require('path');
var fs = require('fs');
var crypto = require('crypto');
var gm = require('gm');
var global = require('./global.js');

function servePage(req,res,next)
{
	var connection = mysql.createConnection( global.config.database );
	connection.query(
		'SELECT name FROM Characters WHERE owner = ? AND canonical_name = ?;',
		[req.params.user, req.params.char],
		function(err,rows,fields){
			if( err ){
				global.error( err, global.logLevels.warning );
				res.send(500);
			}
			else if( rows.length == 1 ){
				if( req.url.indexOf('angular') > -1 ){
					global.log('Serving angular character page for', req.url);
					global.renderPage('charsheet_new', {toonName: rows[0].name})(req,res);
				}
				else {
					global.log('Serving character page for', req.url);
					global.renderPage('charsheet', {toonName: rows[0].name})(req,res);
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
	var connection = mysql.createConnection( global.config.database );
	connection.query(
		'SELECT info FROM Characters WHERE owner = ? AND canonical_name = ?;',
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

	var connection = mysql.createConnection( global.config.database );
	connection.query(
		'UPDATE Characters SET info = ?, name = ?, concept = ?, last_updated = NOW() WHERE owner = ? AND canonical_name = ?;',
		[JSON.stringify(req.body), req.body.name, req.body.aspects.high_concept.name, req.params.user, req.params.char],
		function(err,rows,fields){
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
	if( req.session.user ){
		global.log('Serving new character page');
		global.renderPage('newtoon')(req,res);
	}
	else {
		res.send(401);
	}
}

function newCharacterRequest(req,res)
{
	if( !req.session || !req.session.user ){
		global.error('Anonymous character creation attempted!', global.logLevels.error);
		global.renderPage('newtoon', {message: {type: 'error', content:'You must be logged in to create a character'}})(req,res);
		return;
	}
	else if( !(req.body && req.body.name && req.body.concept && req.body.canon_name) ){
		global.error('Incomplete character creation attempted', global.logLevels.error);
		global.renderPage('newtoon', {message: {type: 'error', content:'You must fill out all fields'}})(req,res);
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
			'name': 'Physical','skill': 'Endurance','toughness': 0, 'strength': 2, 'armor': []},{
			'name': 'Mental','skill': 'Conviction','toughness': 0,'strength': 2,'armor': []},{
			'name': 'Social','skill': 'Presence','toughness': 0,'strength': 2,'armor': []}],
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
		'powers': []
	};

	global.log('Attempting character creation');
	var connection = mysql.createConnection( global.config.database );
	connection.query('INSERT INTO Characters SET created_on=NOW(), last_updated=NOW(), ?;',
		{'canonical_name': req.body.canon_name, 'name': req.body.name, 'owner': req.session.user,
			'concept': req.body.concept, 'info': JSON.stringify(toon)},
		function(err,rows,fields)
		{
			if( err ){
				global.error('MySQL error:', err);
				global.renderPage('newtoon', {message: {type: 'error', content:'You are already using that short name'}})(req,res);
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

function deleteCharacterPage(req,res)
{
	if( !(req.session && req.session.user) ){
		res.send(401);
		return;
	}

	var connection = mysql.createConnection(global.config.database);
	connection.query('SELECT name, concept FROM Characters WHERE owner = ? AND canonical_name = ?;',
		[req.session.user, req.query.id],
		function(err,rows,fields)
		{
			if( err ){
				global.error('MySQL error: ', err);
				global.renderPage('killtoon', {message: {type: 'error', content: err}})(req,res);
			}
			else if( rows.length == 0 ){
				global.error('No such character: '+req.query.id);
				//global.renderPage('killtoon', {message: {type: 'error', content: 'Character id does not exist, cannot be deleted.'}})(req,res);
				req.session.latent_message = 'Character id does not exist, cannot be deleted.';
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
	var connection = mysql.createConnection(global.config.database);
	connection.query('DELETE FROM Characters WHERE owner = ? AND canonical_name = ?;',
		[req.session.user, req.body.charname],
		function(err,info)
		{
			if(err){
				global.error('MySQL error:', err);
				global.renderPage('killtoon', {code: 500, message: {type: 'error', content: err}})(req,res);
			}
			else if(info.affectedRows == 0){
				global.log('No such character to delete');
				global.renderPage('killtoon', {code: 403, message: {type: 'error', content: 'Character id does not exist, cannot be deleted.'}})(req,res);
			}
			else {
				global.log('Character deleted');
				req.session.latent_message = 'Character "'+req.body.charname+'" successfully deleted.';
				res.redirect('/'+req.session.user);
			}
			connection.end();
		}
	);
}

function serveAvatar(req,res,next)
{
	var connection = mysql.createConnection(global.config.database);
	connection.query('SELECT avatar FROM Characters WHERE owner = ? AND canonical_name = ?;',
		[req.params.user, req.params.char],
		function(err,info)
		{
			if(err){
				global.error('MySQL error:', err);
				next();
			}
			else if(info.length == 0 || !info[0].avatar){
				global.log('Avatar not found');
				res.send(404);
			}
			else {
				res.sendfile( libpath.resolve(__dirname, 'uploads', info[0].avatar) );
			}
			connection.end();
		}
	);
}

function saveAvatar(req,res,next)
{
	if( !(req.session && req.session.user) ){
		res.send(401);
		return;
	}

	// scale down to what will fit in the avatar box
	var newFile = req.files.avatar.path;
	gm(newFile).size(function(err,size){
		if(!err){
			var factor = size.width>size.height ? 350/size.width : 196/size.height;
			gm(newFile)
				.resize( size.width*factor, size.height*factor )
				.write(newFile, function(err){
					if(err) global.error(err);
				});
		}
		else global.log(err);
	});

	var connection = mysql.createConnection(global.config.database);

	function saveNewAvatar(err,info)
	{
		if(err){
			global.error('MySQL error:', err);
			res.send(500);
		}
		else if(info.affectedRows == 0){
			global.log('Avatar not found');
			res.send(404);
		}
		else {
			global.log('Avatar saved');
			res.send(200);
		}
		connection.end();
	}

	function getCurrentAvatar(err,info)
	{
		if(err){
			global.error('MySQL error:', err);
			res.send(500);
			connection.end();
			return;
		}
		else if(info.length == 1 && info[0].avatar){
			fs.unlink( libpath.resolve(__dirname, 'uploads', info[0].avatar) );
		}

		var filename = libpath.basename(req.files.avatar.path);
		connection.query('UPDATE Characters SET avatar = ? WHERE owner = ? AND canonical_name = ?;',
			[filename, req.session.user, req.params.char],
			saveNewAvatar
		);
	}

	connection.query('SELECT avatar FROM Characters WHERE owner = ? AND canonical_name = ?;',
		[req.session.user, req.params.char],
		getCurrentAvatar
	);

}

exports.servePage = servePage;
exports.serveJson = serveJson;
exports.pushJson = pushJson;

exports.newCharacterPage = newCharacterPage;
exports.newCharacterRequest = newCharacterRequest;

exports.deleteCharacterRequest = deleteCharacterRequest;
exports.deleteCharacterPage = deleteCharacterPage;

exports.serveAvatar = serveAvatar;
exports.saveAvatar = saveAvatar;
