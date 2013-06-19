/*
 * Stores global functions and handlers that are always useful
 */

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

// export everything for external modules
exports.error = error;
exports.log = log;
exports._404 = _404;
exports.logLevels = logLevels;

