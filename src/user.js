var mysql = require('mysql');
var libpath = require('path');

var global = require('./global.js');
var config = require('../config.json');

function userPage(req,res,next)
{
	var connection = mysql.createConnection( config.database );
	connection.query(
		'SELECT Users.username, Characters.name, Characters.canonical_name, Characters.concept, Characters.private '+
		'FROM Users LEFT JOIN Characters ON Users.username = Characters.owner '+
		'WHERE BINARY Users.username = ? ORDER BY Characters.last_updated DESC;', [req.params.user],
		function(err,rows,fields){
			if( err ){
				global.error( err, global.logLevels.warning );
			}
			else if( rows.length != 0 )
			{
				global.log('Serving user page for', rows[0].username);

				var toons = [], privateToons = [];
				for( var i in rows ){
					if( rows[i].name != null && rows[i].canonical_name != null )
					{
						var toon = {'name': rows[i].name, 'canon_name': rows[i].canonical_name, 'concept': rows[i].concept};
						if(rows[i].private)
							privateToons.push(toon);
						else
							toons.push(toon);
					}
				}
				global.renderPage('userpage', {toons: toons, privateToons: privateToons})(req,res);
			}
			else {
				next();
			}
			connection.end();
		}
	);
}

function newUserPage(req,res,next)
{
	var connection = mysql.createConnection( config.database );
	connection.query('SELECT COUNT(*) AS count FROM Users WHERE BINARY username = ?;', [req.params.user], function(err,rows,fields)
	{
		if(err){
			global.error(err);
			global.renderPage('404', {code:500})(req,res);
		}
		else if(rows[0].count === 1){
			global.log('Serving user page for', req.params.user);
			global.renderPage('userpage_new',{})(req,res);
		}
		else {
			next();
		}
		connection.end();
	});
}

function userJson(req,res,next)
{
	var connection = mysql.createConnection( config.database );
	connection.query(
		'SELECT Characters.owner, Characters.name, Characters.canonical_name, Characters.concept, '+
			'Characters.private, Characters.last_updated, Characters.created_on '+
		'FROM Users LEFT JOIN Characters ON Users.username = Characters.owner '+
		'WHERE BINARY Users.username = ?;', [req.params.user],
		function(err,rows,fields){
			if( err ){
				global.error( err, global.logLevels.warning );
			}
			else if( rows.length > 0 )
			{
				global.log('Serving user json for', req.params.user);
			
				if( rows.length === 1 && rows.canonical_name === null )
				{
					res.json([]);
				}
				else
				{
					if( req.params.user === req.session.user ){
						res.json(rows);
					}
					else {
						var publicOnly = rows.filter(function(e){ return e.private == false; });
						res.json(publicOnly);
					}
				}
			}
			else {
				next();
			}
			connection.end();
		}
	);
}

function togglePrivacy(req,res,next)
{
	// check if a user is logged in and passed the correct data
	if( !(req.session && req.session.user) ){
		res.send(401);
		return;
	}
	else if( !(req.body && req.body.id) ){
		res.send(400);
		return;
	}

	var connection = mysql.createConnection( config.database );
	connection.query(
		'UPDATE Characters SET private = private XOR true WHERE BINARY owner = ? AND BINARY canonical_name = ?;',
		[req.session.user, req.body.id],
		function(err,info){
			if(err){
				global.error('MySQL error:', err);
				res.send(500);
			}
			else if(info.affectedRows == 0){
				global.log('No such character to toggle privacy');
				res.send(404, 'No such character');
			}
			else {
				global.log('Character', req.body.id, 'made private/public');
				res.send(200);
			}
			connection.end();
		}
	);
}

exports.userPage = newUserPage;
exports.userJson = userJson;
exports.togglePrivacy = togglePrivacy;

