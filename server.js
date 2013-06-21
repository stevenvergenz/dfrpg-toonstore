var https = require('https');
var fs = require('fs');
var libpath = require('path');
var mime = require('mime');
var liburl = require('url');

var global = require('./global.js');
var register = require('./register.js');
var login = require('./login.js');


function startServer()
{
	var options = {
		key: fs.readFileSync( global.config.ssl_info.key ),
		cert: fs.readFileSync( global.config.ssl_info.cert )
	};

	var server = https.createServer(options, function(request,response)
	{
		var url = liburl.parse(request.url, true);

		// convert url to fs path
		var path = 'public' + url.pathname;
		if( url.pathname == '/' )
			path += 'index.html';
		path = libpath.normalize(path);

		// serve registration requests
		if( /^\/register/.test( url.pathname ) ){
			register.handleRequest(request,response);
		}

		// serve login requests
		else if( /^\/login/.test( url.pathname ) ){
			login.handleRequest(request,response);
		}

		// serve files from the public dir
		else if( fs.existsSync(path) && fs.statSync(path).isFile() ){
			global.log('Serving file:', path);
			fs.readFile(path, function(err,data){
				response.writeHead(200, {'Content-Type': mime.lookup(path)});
				response.end(data);
			});
		}
	
		// return 404
		else {
			global.error('File not found:', path, global.logLevels.warning);
			global._404(response);
		}
	});

	server.listen(3001);
	global.log('Server running at http://localhost:3001/');
}

exports.startServer = startServer;
