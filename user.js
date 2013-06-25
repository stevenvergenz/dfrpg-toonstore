var mysql = require('mysql');
var libpath = require('path');

var global = require('./global.js');

function userPage(req,res,next)
{
	var connection = mysql.createConnection( global.config.database );
	connection.query(
		'SELECT Users.username, Characters.name, Characters.canonical_name, Characters.concept '+
		'FROM Users LEFT JOIN Characters ON Users.username = Characters.owner '+
		'WHERE Users.username = ?;', [req.params.user],
		function(err,rows,fields){
			if( !err && rows.length != 0 )
			{
				var pageFields = {'logged_user': req.session.user, 'user': rows[0].username, 'chars': []};
				console.log(pageFields);
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
		}
	);
}

function characterPage(req,res,next)
{
	var connection = mysql.createConnection( global.config.database );
	connection.query(
		'SELECT COUNT(canonical_name) AS count FROM Characters WHERE owner = ? AND canonical_name = ?;',
		[req.params.user, req.params.char],
		function(err,rows,fields){
			if( !err && rows[0].count == 1 ){
				res.sendfile( libpath.normalize('public/charsheet.html') );
			}
			else {
				next();
			}
		}
	);
}

exports.userPage = userPage;
exports.characterPage = characterPage;

