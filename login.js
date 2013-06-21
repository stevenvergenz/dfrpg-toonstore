var libpath = require('path');
var mysql = require('mysql');
var liburl = require('url');
var fs = require('fs');

var global = require('./global.js');


function handleRequest(request,response)
{
	var url = liburl.parse(request.url, true);

	// serve login page
	if( url.pathname == '/login' && request.method == 'GET' ){
		global.log('Serving login page');
		fs.readFile(libpath.normalize('./public/login.html'), function(err,data){
			response.writeHead(200, {'Content-Type': mime.lookup(path)});
			response.end(data);
		});
	}

	// log user in
	else if( url.pathname == '/login' && request.method == 'POST' )
	{	
		var body = '';
		request.on('data', function(chunk){
			body += chunk;
		});

		request.on('end', function()
		{
			body = global.parsePostData(body);
			
		});
	}
}

exports.handleRequest = handleRequest;
