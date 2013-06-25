var mysql = require('mysql');
var libpath = require('path');

var global = require('./global.js');

function userPage(req,res,next)
{
	var connection = mysql.createConnection( global.config.database );
	connection.query(
		'SELECT Users.username, Characters.name, Characters.canonical_name '+
		'FROM Users LEFT JOIN Characters ON Users.username = Characters.owner '+
		'WHERE Users.username = ?;', [req.params.user],
//	connection.query('SELECT COUNT(username) AS count FROM Users WHERE username=?;', [req.params.user],
		function(err,rows,fields){
			if( !err && rows.length != 0 )
			{
				console.log(rows);

				var pageFields = {'user': rows[0].username, 'chars': []};

				for( var i in rows ){
					if( rows[i].name != null && rows[i].canonical_name != null ){
						pageFields.chars.push( 
							{'name': rows[i].name, 'canon_name': rows[i].canonical_name}
						);
					}
				}
				console.log(pageFields);
				res.render('userpage', pageFields);
				//res.sendfile( libpath.normalize('./public/user.html') );
			}
			else {
				next();
			}
		}
	);
}

exports.userPage = userPage;

