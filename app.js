var http = require('http'),
fs = require('fs'),
libpath = require('path'),
mime = require('mime');

var server = http.createServer(function(request,response)
{
	// convert url to fs path
	var path = 'public' + request.url;
	if( request.url == '/' && fs.existsSync('public/index.html') ){
		fs.readFile('public/index.html', function(err,data){
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.end(data);
		});
	}
	else if( fs.existsSync(path) ){
		fs.readFile(path, function(err,data){
			response.writeHead(200, {'Content-Type': mime.lookup(path)});
			response.end(data);
		});
	}
	else {
		response.writeHead(404, {'Content-Type': 'text/plain'});
		response.end('404: Not Found');
	}
});

server.listen(3000);
console.log('Server running at http://localhost:3000/');
