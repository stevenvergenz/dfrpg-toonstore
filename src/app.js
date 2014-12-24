var http = require('http'), https = require('https');
var fs = require('fs');
var libpath = require('path');
var liburl = require('url');
var express = require('express');

var global = require('./global.js');
var config = require('../config.json');
var register = require('./register.js');
var activate = require('./activate.js');
var login = require('./login.js');
var user = require('./user.js');
var character = require('./character.js');
var sitemap = require('./sitemap.js');
var stats = require('./stats.js');
var sass = require('./sass.js');

// create the express application
var app = express();
app.use(express.bodyParser({
	keepExtensions: true,
	uploadDir: libpath.resolve(__dirname,'..','uploads')
}));


app.use(express.cookieParser());
app.use(express.session({secret: config.cookie_secret}));
app.set('views', libpath.resolve(__dirname,'..','templates'));
app.set('view engine', 'jade');

// the global logger middleware
app.use(express.logger());

// route the registration pages
app.get('/register', global.renderPage('register'));
app.get('/federated-register', global.renderPage('register'));
app.get('/post-register', global.renderPage('register'));
app.post('/register', register.register);
app.post('/federated-register', register.federatedRegister);
app.get('/register/verify', register.checkUsername);

// route the activation pages (password resets)
app.get('/passreset', global.renderPage('activation'));
app.post('/passreset', activate.passwordReset);
app.get('/pre-activate', global.renderPage('activation'));
app.get('/activate/:token([0-9a-f]{32})', activate.serveActivationPage);
app.post('/activate/:token([0-9a-f]{32})', activate.setPassword);

// route the login pages
app.get('/login', global.renderPage('login', {g_client_id: config.google_client_id}));
app.post('/login/persona', login.processPersonaLogin);
app.post('/login', login.processLogin);
app.post('/logout', login.processLogout);

// route the user pages
app.get('/:user([A-Za-z0-9_-]+)', user.userPage);
app.get('/:user([A-Za-z0-9_-]+).json', user.userJson);

// route the character management pages
app.get('/newtoon', character.newCharacterPage);
app.post('/newtoon', character.newCharacterRequest);
app.get('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/', character.servePage);
app.get('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/printable', character.servePage);
app.get('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/json', character.serveJson);
app.post('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/json', character.pushJson);
app.get('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/avatar', character.serveAvatar);
app.post('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/avatar', character.saveAvatar);


// redirect if character sheet doesn't have trailing slash
app.get('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)', function(req,res,next){
	if( req.params.user != 'site' )
		res.redirect(req.url + '/');
	else
		next();
});

app.post('/killtoon', character.deleteCharacterRequest);
app.get('/killtoon', character.deleteCharacterPage);
app.post('/togglePrivacy', user.togglePrivacy);

// route the extra pages
app.get('/site/about', global.renderPage('about'));
app.get('/site/contact', global.renderPage('contact'));
app.get('/site/terms', global.renderPage('terms'));
app.get('/site/privacy', global.renderPage('privacy'));
app.get('/', global.renderPage('index'));

app.use('/static', express.static( libpath.resolve(__dirname,'..','static'), {maxAge: 24*60*60}));
app.get('/sitemap.xml', sitemap.serve);

app.get('/stats', stats.serveStats);


// catch-all: serve static file or 404
app.use(function(req,res)
{
	if( req.url != '/favicon.ico' ){
		global.error('File not found:', req.url, global.logLevels.warning);
		global.renderPage('404', {code: 404})(req,res);
	}
	else
		res.send(404);
});



sass.compile( startServer );

function startServer()
{
	// start the server
	if( config.use_ssl )
	{
		var sslconfig = {
			key: fs.readFileSync(config.ssl_key),
			cert: fs.readFileSync(config.ssl_cert)
		};

		if( config.ssl_password )
			sslconfig.passphrase = config.ssl_password;

		https.createServer(sslconfig,app).listen(config.port);
	}
	else
	{
		http.createServer(app).listen(config.port);
	}
	global.log('Server running on port', config.port, 'with origin', config.origin);
}

