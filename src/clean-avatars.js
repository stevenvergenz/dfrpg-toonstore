var fs = require('fs'),
	libpath = require('path'),
	util = require('util'),
	mysql = require('mysql');

var config = require('../config.json');

function log()
{
	var args = Array.prototype.slice.call(arguments);
	var output = util.format('[%s] %s', (new Date()).toISOString(), args.join(' '));
	console.log(output);
}

log('Starting avatar cleanup');

var connection = mysql.createConnection( config.database );
connection.query('SELECT avatar FROM Characters;', function(err,rows,fields)
{
	connection.end();

	var avatars = rows
		.reduce(function(arr,val){
			if( arr.indexOf(val.avatar) === -1 )
				arr.push(val.avatar);
			return arr;
		}, []);

	var uploaddir = libpath.resolve(__dirname, '..', 'uploads');
	fs.readdir( uploaddir, function(err,files)
	{
		if(err){
			log('Could not read contents of uploads directory', err);
		}
		else
		{
			var ref = 0, unref = 0;
			for(var i=0; i<files.length; i++)
			{
				if( files[i] === '.gitignore' ){
					continue;
				}
				else if( avatars.indexOf( files[i] ) === -1 ){
					fs.unlink( libpath.resolve(uploaddir, files[i]) );
					unref++;
					log('Removed file', files[i]);
				}
				else {
					ref++;
				}
			}

			log( util.format('Cleanup complete: %d files, %d referenced, %d deleted', files.length-1, ref, unref) );
		}
	});
});
