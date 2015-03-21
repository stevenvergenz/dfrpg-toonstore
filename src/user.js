var mysql = require('mysql');
var libpath = require('path');

var global = require('./global.js');
var config = require('../config.json');


function newUserPage(req,res,next)
{
	var connection = mysql.createConnection( config.database );
	connection.query('SELECT COUNT(*) AS count FROM Users WHERE BINARY username = ?;', [req.params.user], function(err,rows,fields)
	{
		if(err){
			global.error('MySQL error:', err);
			global.renderPage('index', {code:500, message: {type:'error', content: res.i18n.__('server.genericErr')}})(req,res);
		}
		else if(rows[0].count === 1){
			global.log('Serving user page for', req.params.user);
			global.renderPage('userpage',{})(req,res);
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
				res.send(500);
			}
			else if( rows.length > 0 )
			{
				global.log('Serving user json for', req.params.user);
			
				if( rows.length === 1 && rows[0].canonical_name === null )
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

