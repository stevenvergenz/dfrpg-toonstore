var fs = require('fs');
var libpath = require('path');
var liburl = require('url');
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
	else if( url.pathname == '/register/verify' ){
		console.log(request);
	}
}

exports.handleRequest = handleRequest;

