/*
 * Stores global functions and handlers that are always useful
 */
var libpath = require('path');

var config = {
	'database': {
		'host': 'localhost',
		'user': 'toonstore',
		'password': 'KhazdanWillNeverDie',
		'database': 'toonstore'
	},
	'ssl_info': {
		'key': libpath.normalize('keys/agent2-key.pem'),
		'cert': libpath.normalize('keys/agent2-cert.pem')
	},
	'port': 3001,
	'cookie_secret': 'I return from whence I came...'
};


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
			'logged_user': req.session.user,
			'owner': req.params.user,
			'toon': req.params.char
		};

		// argument options
		for( var i in options ){
			pageFields[i] = options[i];
		}

		log('Rendering template "', template, '" with options', pageFields);
		return res.render(template, pageFields);
	};

	return middleware;
}

// export everything for external modules
exports.error = error;
exports.log = log;
exports.logLevels = logLevels;
exports.config = config;
exports.renderPage = renderPage;

