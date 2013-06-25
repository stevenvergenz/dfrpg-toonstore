var https = require('https');
var fs = require('fs');
var libpath = require('path');
var liburl = require('url');
var express = require('express');
var mysql = require('mysql');

var global = require('./global.js');
var register = require('./register.js');
var login = require('./login.js');

// create the express application
var app = express();
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: global.config.cookie_secret}));

// the global logger middleware
/*app.use( function(req,res,next){
	global.log(req.method, req.url);
	next();
});*/
app.use(express.logger());

// route the registration pages
app.get('/register', register.registrationPage);
app.post('/register', register.register);
app.get('/register/verify', register.checkUsername);

// route the login pages
app.get('/login', login.loginPage);
app.post('/login', login.processLogin);

// route the user pages
app.get('/:user', function(req,res,next)
{
	var connection = mysql.createConnection( global.config.database );
	connection.query('SELECT COUNT(username) AS count FROM Users WHERE username=?;', [req.params.user],
		function(err,rows,fields){
			if( !err && rows[0].count != 0 ){
				res.sendfile( libpath.normalize('./public/user.html') );
			}
			else {
				res.send(404, 'No such user');
			}
		}
	);
});

// catch-all: serve static file or 404
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

// start the server
var options = {
	key: fs.readFileSync( global.config.ssl_info.key ),
	cert: fs.readFileSync( global.config.ssl_info.cert )
};
https.createServer(options, app).listen(global.config.port);
global.log('Server running at http://localhost:'+global.config.port+'/');

