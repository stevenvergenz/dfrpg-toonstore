var libpath = require('path');
var mysql = require('mysql');

var global = require('./global.js');

function newCharacterPage(req,res)
{
	if( req.session.user ){
		global.log('Serving new character page');
		var params = {page: req.url, logged_user: req.session.user};
		res.render('newtoon', params);
	}
	else {
		res.redirect('/login?redir=/newtoon');
	}
}

function newCharacterRequest(req,res)
{
	// create blank character JSON object
	var toon = {
		'name': req.body.name,
		'player': req.session.user,
		'aspects': {
			'high_concept': {'name': req.body.concept,'description': ''},
			'trouble': {'name': '', 'description': ''},
			'aspects': []},
		'stress': [{
			'name': 'Physical','skill': 'Endurance','toughness': 0,'boxes': [{'used': false},{'used':false}],'armor': []},{
			'name': 'Mental','skill': 'Conviction','toughness': 0,'boxes': [{'used': false},{'used':false}],'armor': []},{
			'name': 'Social','skill': 'Presence','toughness': 0,'boxes': [{'used': false},{'used':false}],'armor': []}],
		'consequences': [{
			'severity': 'Mild','mode': 'Any','used': false,'aspect': ''},{
			'severity': 'Moderate','mode': 'Any','used': false,'aspect': ''},{
			'severity': 'Severe','mode': 'Any','used': false,'aspect': ''},{
			'severity': 'Extreme','mode': 'Any','used': false,'aspect': 'Replace permanent'}],
		'totals': {
			'power_level': 'Submerged','base_refresh': 12,'skill_cap': 5,'skills_total': 42,
			'skills_available': 42,'adjusted_refresh': 12,'fate_points': 0},
		'skills': {
			'5': [],'4': [],'3': [],'2': [],'1': []},
		'powers': []
	};

	global.log('Attempting character creation');
	var connection = mysql.createConnection( global.config.database );
	connection.query('INSERT INTO Characters SET created_on=NOW(), ?;',
		{'canonical_name': req.body.canon_name, 'name': req.body.name, 'owner': req.session.user,
			'concept': req.body.concept, 'info': JSON.stringify(toon)},
		function(err,rows,fields)
		{
			if( err ){
				global.error('MySQL error:', err);
				var params = {page: req.url, logged_user: req.session.user, 
					message: 'You are already using that short name'};
				res.render('newtoon', params);
			}
			else {
				global.log('Creation successful');
				var url = '/'+req.session.user+'/'+req.body.canon_name;
				res.redirect(url);
			}
			connection.end();
		}
	);
}

exports.newCharacterPage = newCharacterPage;
exports.newCharacterRequest = newCharacterRequest;

