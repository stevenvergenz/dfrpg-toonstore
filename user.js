var mysql = require('mysql');
var libpath = require('path');

var global = require('./global.js');

function userPage(req,res,next)
{
	var connection = mysql.createConnection( global.config.database );
	connection.query(
		'SELECT Users.username, Characters.name, Characters.canonical_name, Characters.concept '+
		'FROM Users LEFT JOIN Characters ON Users.username = Characters.owner '+
		'WHERE Users.username = ? ORDER BY Characters.last_updated DESC;', [req.params.user],
		function(err,rows,fields){
			if( err ){
				global.error( err, global.logLevels.warning );
			}
			else if( rows.length != 0 )
			{
				global.log('Serving user page for', rows[0].username);

				var toons = [];
				for( var i in rows ){
					if( rows[i].name != null && rows[i].canonical_name != null ){
						toons.push( 
							{'name': rows[i].name, 'canon_name': rows[i].canonical_name, 'concept': rows[i].concept}
						);
					}
				}
				global.renderPage('userpage', {toons: toons})(req,res);
			}
			else {
				next();
			}
			connection.end();
		}
	);
}

exports.userPage = userPage;
