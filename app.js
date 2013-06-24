var https = require('https');
var fs = require('fs');
var libpath = require('path');
var liburl = require('url');
var express = require('express');

var global = require('./global.js');
var register = require('./register.js');
var login = require('./login.js');


var app = express();
app.use(express.bodyParser());

app.use( function(req,res,next){
	global.log(req.method, req.url);
	next();
});

app.get('/register', register.registrationPage);
app.post('/register', register.register);
app.get('/register/verify', register.checkUsername);

//app.get('/login', login.handleRequest);

app.use(function(req,res)
{
	var url = liburl.parse(req.url, true);

	// convert url to fs path
	var path = 'public' + url.pathname;
	if( url.pathname == '/' )
		path += 'index.html';
	path = libpath.normalize(path);

	// serve files from the public dir
	if( fs.existsSync(path) && fs.statSync(path).isFile() ){
		global.log('Serving', path);
		res.sendfile(path);
	}
	
	// return 404
	else {
		global.error('File not found:', path, global.logLevels.warning);
		res.send(404, '404 Not Found');
	}

});


var options = {
	key: fs.readFileSync( global.config.ssl_info.key ),
	cert: fs.readFileSync( global.config.ssl_info.cert )
};
https.createServer(options, app).listen(3001);
global.log('Server running at http://localhost:3001/');

