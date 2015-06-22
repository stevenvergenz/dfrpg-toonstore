var http = require('http'), https = require('https'),
	fs = require('fs'),
	libpath = require('path'),
	liburl = require('url'),
	express = require('express'),
	qr = require('qr-image');

var global = require('./global.js'),
	config = require('../config.json'),
	register = require('./register.js'),
	activate = require('./activate.js'),
	login = require('./login.js'),
	user = require('./user.js'),
	character = require('./character.js'),
	avatars = require('./avatars.js'),
	sitemap = require('./sitemap.js'),
	stats = require('./stats.js'),
	sass = require('./sass.js'),
	i18n = require('./i18n.js');


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

app.use(i18n.detect);

// route the registration pages
app.get('/register', i18n.cookieRedirect, global.renderPage('register'));
app.get('/federated-register', i18n.cookieRedirect, global.renderPage('register'));
app.get('/post-register', global.renderPage('register'));
app.post('/register', register.register);
app.post('/federated-register', register.federatedRegister);
app.get('/register/verify', register.checkUsername);

// route the activation pages (password resets)
app.get('/passreset', i18n.cookieRedirect, global.renderPage('activation'));
app.post('/passreset', activate.passwordReset);
app.get('/pre-activate', global.renderPage('activation'));
app.get('/activate/:token([0-9a-f]{32})', i18n.cookieRedirect, activate.serveActivationPage);
app.post('/activate/:token([0-9a-f]{32})', activate.setPassword);

// route the login pages
app.get('/login', i18n.cookieRedirect, global.renderPage('login', {g_client_id: config.google_client_id}));
app.post('/login/persona', login.processPersonaLogin);
app.post('/login', login.processLogin);
app.post('/logout', login.processLogout);

// route the user pages
app.get('/:user([A-Za-z0-9_-]+)', i18n.cookieRedirect, user.userPage);
app.get('/:user([A-Za-z0-9_-]+).json', user.userJson);

// route the character management pages
app.get('/newtoon', i18n.cookieRedirect, character.newCharacterPage);
app.post('/newtoon', character.newCharacterRequest);
app.get('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/', i18n.cookieRedirect, character.servePage);
app.get('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/printable', i18n.cookieRedirect, character.servePage);
app.get('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/json', character.serveJson);
app.post('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/json', character.pushJson);
app.get('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/avatar', avatars.serveAvatar);
app.post('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/avatar', avatars.saveAvatar);


// redirect if character sheet doesn't have trailing slash
app.get('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)$', function(req,res,next){
	if( req.params.user != 'site' )
		res.redirect(req.url + '/');
	else
		next();
});

app.post('/killtoon', character.deleteCharacterRequest);
app.get('/killtoon', i18n.cookieRedirect, character.deleteCharacterPage);
app.post('/togglePrivacy', user.togglePrivacy);

// generate donation information
config.donation_address = config.donation_address || '1CX5xJ3o4rXcNRTrWGd2zCmAMtpCXGZo78';
app.get('/site/donate', i18n.cookieRedirect, global.renderPage('donate', {donation_address: config.donation_address}));
app.get('/site/donate/donation_qr.png', function(req,res,next)
{
	var donor = req.query.user ? '?message=Thanks%20from%20'+req.query.user : '';
	var code = qr.image( 'bitcoin:' + config.donation_address + donor, {type:'png'} );
	//var output = fs.createWriteStream( libpath.resolve(__dirname, '..','static','img','donation_qr.png') );
	code.pipe(res);
});


// route the extra pages
app.get('/site/about', i18n.cookieRedirect, global.renderPage('about'));
app.get('/site/contact', i18n.cookieRedirect, global.renderPage('contact'));
app.get('/site/terms', i18n.cookieRedirect, global.renderPage('terms'));
app.get('/site/privacy', i18n.cookieRedirect, global.renderPage('privacy'));
app.get('/site/howto', i18n.cookieRedirect, global.renderPage('howto'));
app.get('/', i18n.cookieRedirect, global.renderPage('index'));

app.use('/static', express.static( libpath.resolve(__dirname,'..','static'), {maxAge: 24*60*60}));
app.get('/sitemap.xml', sitemap.serveSitemap);
app.get('/robots.txt', sitemap.serveRobots);
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


sass.compile( '../static/scss', startServer );

function startServer(err)
{
	if(err){
		global.error('Sass failed to compile! See above errors for debugging.');
	}
	else {
		global.log('Sass compiled successfully');
	}

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

