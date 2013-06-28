var mysql = require('mysql');
var libpath = require('path');

var global = require('./global.js');

function userPage(req,res,next)
{
	var connection = mysql.createConnection( global.config.database );
	connection.query(
		'SELECT Users.username, Characters.name, Characters.canonical_name, Characters.concept '+
		'FROM Users LEFT JOIN Characters ON Users.username = Characters.owner '+
		'WHERE Users.username = ? ORDER BY Characters.created_on;', [req.params.user],
		function(err,rows,fields){
			if( !err && rows.length != 0 )
			{
				global.log('Serving user page for', rows[0].username);

				var pageFields = {'page': req.url, 'logged_user': req.session.user, 'user': rows[0].username, 'chars': []};
				for( var i in rows ){
					if( rows[i].name != null && rows[i].canonical_name != null ){
						pageFields.chars.push( 
							{'name': rows[i].name, 'canon_name': rows[i].canonical_name, 'concept': rows[i].concept}
						);
					}
				}
				res.render('userpage', pageFields);
			}
			else {
				next();
			}
			connection.end();
		}
	);
}

function characterPage(req,res,next)
{
	var connection = mysql.createConnection( global.config.database );
	connection.query(
		'SELECT info FROM Characters WHERE owner = ? AND canonical_name = ?;',
		[req.params.user, req.params.char],
		function(err,rows,fields){
			if( !err && rows.length == 1 ){
				global.log('Serving character page for', req.url);
				var pageFields = {'page': req.url, 'logged_user': req.session.user, 'user': rows[0].username};
				pageFields.toon = JSON.parse(rows[0].info);
				res.render('charsheet', pageFields);
			}
			else {
				next();
			}
			connection.end();
		}
	);
}

exports.userPage = userPage;
exports.characterPage = characterPage;

