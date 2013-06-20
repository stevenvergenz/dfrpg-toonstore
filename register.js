var fs = require('fs');
var libpath = require('path');
var global = require('./global.js');

function handleRequest(request, response)
{
	// root /register page
	if( /^\/register\/?$/.test(request.url) ){
		var path = libpath.normalize('public/register.html');

		global.log('Serving registration file:', path);
		fs.readFile( path, function(err,data){
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.end(data);
		});
	}
}

exports.handleRequest = handleRequest;

