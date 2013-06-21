var fs = require('fs');
var libpath = require('path');
var liburl = require('url');
var mysql = require('mysql');
var crypto = require('crypto');

var global = require('./global.js');


function handleRequest(request, response)
{
	var url = liburl.parse(request.url, true);

	// root /register page
	if( url.pathname == '/register' && request.method == 'GET' )
	{
		var path = libpath.normalize('public/register.html');

		global.log('Serving registration file:', path);
		fs.readFile( path, function(err,data){
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.end(data);
		});
	}

	// registration request
	else if( url.pathname == '/register' && request.method == 'POST' )
	{
		var body = '';
		request.on('data', function(chunk){
			body += chunk;
		});

		request.on('end', function()
		{
			body = parseData(body);

			// salt and hash the password
			body.salt = crypto.randomBytes(32);
			body.password = crypto.pbkdf2Sync(body.password, body.salt, 1000, 32);
			body.salt = body.salt.toString('hex');
			body.password = body.password.toString('hex');
			global.log('Registering user:', body);

			// connect to the db
			var connection = mysql.createConnection( global.config.database );
			connection.query(
				'INSERT INTO Users SET registered = DEFAULT, last_login = DEFAULT, username = ?, email = ?, salt = UNHEX(?), password = UNHEX(?);', 
				[body.username,body.email,body.salt,body.password],
				function(err, rows, fields){
					if( err ){
						global.log('Registration error:', err);
						response.writeHead(500);
						response.end();
					}
					else {
						global.log('Registration successful');
						response.writeHead(200);
						response.end();
					}
				}
			);

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

function parseData(post)
{
	var retData = {};
	var args = post.split('&');
	for( var i in args ){
		var kvp = args[i].split('=');
		retData[kvp[0]] = kvp[1];
	}
	return retData;
}

exports.handleRequest = handleRequest;

