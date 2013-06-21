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
	}
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

function _404(response)
{
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.end('404 Not Found');
}

function redirect(url, response)
{
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(
	"<html>" +
		"<head>" +
		"	<title>Virtual World Framework</title>" +
		"	<meta http-equiv=\"REFRESH\" content=\"0;url="+url+"\">" +
		"</head>" +
		"<body>" +
		"</body>" +
	"</html>");
	response.end();
	return;	
}

function cleanPath(path){
	return '.'+libpath.sep+libpath.normalize(path);
}

function parsePostData(post)
{
	var retData = {};
	var args = post.split('&');
	for( var i in args ){
		var kvp = args[i].split('=');
		retData[kvp[0]] = kvp[1];
	}
	return retData;
}


// export everything for external modules
exports.error = error;
exports.log = log;
exports._404 = _404;
exports.logLevels = logLevels;
exports.cleanPath = cleanPath;
exports.config = config;
exports.redirect = redirect;
exports.parsePostData = parsePostData;

