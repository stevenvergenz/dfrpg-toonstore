var fs = require('fs');
var libpath = require('path');
var liburl = require('url');
var mysql = require('mysql');

var global = require('./global.js');


function handleRequest(request, response)
{
	var url = liburl.parse(request.url, true);

	// root /register page
	if( url.pathname == '/register' ){
		var path = libpath.normalize('public/register.html');

		global.log('Serving registration file:', path);
		fs.readFile( path, function(err,data){
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.end(data);
		});
	}

	// username testing
	else if( url.pathname == '/register/verify' )
	{
		var user = url.query.a;
		
		// connect to the db
		var connection = mysql.createConnection( global.config.database );
		connection.query('SELECT COUNT(username) AS userCount FROM Users WHERE username = ?', [user], function(err, rows, fields)
		{
			if( err ){
				global.error('MySQL error:', err);
				response.writeHead(500);
				response.end('MySQL error');
			}
			else {
				var userFound = rows[0]["userCount"] == 1;
				response.writeHead(200, {'Content-Type': 'application/json'});
				response.end(JSON.stringify({found: userFound}));
			}
		});
	}
}

exports.handleRequest = handleRequest;

