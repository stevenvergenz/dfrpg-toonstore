/*
 * Stores global functions and handlers that are always useful
 */
var jade = require('jade'),
	fs = require('fs'),
	libpath = require('path'),
	nodemailer = require('nodemailer'),
	moment = require('moment'),

	config = require('../config.json');

var logLevels = {
	'fatal': 0,
	'error': 1,
	'warning': 2,
	'message': 3
};
var logLevel = logLevels.message;

function error()
{
	// color codes
	var red = '\u001b[31m';
	var brown = '\u001b[33m';
	var reset = '\u001b[0m';

	// get all but the last argument
	var args = Array.prototype.slice.call(arguments);
	var consoleArgs = args.slice(0,-1);
	var level = args[ args.length-1 ];

	// color the first arg red
	consoleArgs[0] = red + consoleArgs[0] + reset;

	// determine if the last arg was a log level
	if( !isNaN(parseInt(level)) ){
		level = parseInt(level);
	}
	else {
		consoleArgs.push(level);
		level = logLevels.message;
	}

	if( level <= logLevel ){
		console.log.apply(this, consoleArgs);
	}
}

function log()
{
	// get all but the last argument
	var args = Array.prototype.slice.call(arguments);
	var consoleArgs = args.slice(0,-1);
	var level = args[ args.length-1 ];

	// determine if the last arg was a log level
	if( !isNaN(parseInt(level)) ){
		level = parseInt(level);
	}
	else {
		consoleArgs.push(level);
		level = logLevels.message;
	}

	if( level <= logLevel ){
		console.log.apply(this, consoleArgs);
	}
}

function renderPage(template, options)
{
	var middleware = function(req,res,next)
	{
		// global template fields
		var pageFields = {
			'page': req.url,
			'query': req.query,
			'logged_user': req.session && req.session.user ? req.session.user : null,
			'logged_user_email': req.session && req.session.user_email ? req.session.user_email : null,
			'persona_user': req.session && req.session.persona ? req.session.persona : null,
			'owner': req.params && req.params.user ? req.params.user : null,
			'toon': req.params && req.params.char ? req.params.char : null
		};
		var statusCode = options && options.code ? options.code : 200;

		// argument options
		for( var i in options ){
			if( i != 'code' )
				pageFields[i] = options[i];
		}

		// latent message
		if( req.session && req.session.latent_message ){
			pageFields.message = {type: 'info', content: req.session.latent_message};
			delete req.session.latent_message;
		}

		// add localization to scope
		pageFields.i18n = res.i18n;
		log('Rendering template "', template, '" with options', pageFields);

		pageFields.__ = res.i18n.__.bind(res.i18n);
		pageFields.__n = res.i18n.__n.bind(res.i18n);
		pageFields.n__ = res.i18n.n__.bind(res.i18n);
		pageFields.n__n = res.i18n.n__n.bind(res.i18n);
		pageFields.getNativeURL = function(lang){
			if(lang)
				return '/'+lang+req.url;
			else
				return '/'+res.i18n.nativeLocale+req.url;
		};
		pageFields.url = function(path){
			if( res.i18n.pathLocale )
				return '/'+res.i18n.pathLocale + path;
			else
				return path;
		};
		pageFields.formatDate = function(date){
			return moment(date).locale(res.i18n.pathLocale).format('LL');
		};

		return res.render(template, pageFields, function(err,html){
			if( !err ){
				res.setHeader('Content-Type', 'text/html; charset=UTF-8');
				res.writeHead(statusCode);
				res.write(html);
				res.end();
			}
			else {
				res.end(String(err));
			}
		});
	};

	return middleware;
}

function renderActivationEmail(to, username, token, registering, i18n)
{
	// build email message
	var template = jade.compile( fs.readFileSync(libpath.resolve(__dirname, '../templates/activate-email.jade')), {pretty: true} );
	var html = template({
		registration: registering,
		url: config.origin + (i18n.pathLocale ? '/'+i18n.pathLocale : ''),
		token: token,
		username: username,
		__: i18n.__.bind(i18n)
	});

	// send out confirmation email
	if(!config.debugEmail){
		var transporter = nodemailer.createTransport(config.smtp);
		transporter.sendMail({
			from: 'no-reply@toonstore.net',
			to: to,
			subject: (registering ? i18n.__('activate-email.subject_reg') : i18n.__('activate-email.subject_noreg')) + ' - ToonStore.net',
			html: html
		});
	}
	else {
		log((registering ? i18n.__('activate-email.subject_reg') : i18n.__('activate-email.subject_noreg')) + ' - ToonStore.net');
		log(html);
	}
}

// export everything for external modules
exports.error = error;
exports.log = log;
exports.logLevels = logLevels;
exports.renderPage = renderPage;
exports.renderActivationEmail = renderActivationEmail;
