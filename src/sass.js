var fs = require('fs'),
	libpath = require('path'),
	sass = require('node-sass'),
	async = require('async'),
	
	global = require('./global.js');


function compileSCSS(callback)
{
	/*
	 * function to compile each file, used as a callback to the async call
	 */
	function compile(item, cb)
	{
		var infile = libpath.resolve(__dirname, '../templates/sass/', item);

		var match = /^([^_][\w]*)\.scss$/.exec(item);
		if( match )
		{
			var outfile = libpath.resolve(__dirname, '../static/css/compiled/', match[1]+'.css');
			var instats, outstats;

			// get the stats for the scss template
			try {
				instats = fs.statSync(infile);
			}
			catch(e){
				global.error('Cannot stat input file', infile);
				cb(e);
				return;
			}

			try {
				outstats = fs.statSync(outfile);
			}
			catch(e){
				outstats = null;
			}

			if( !outstats || instats.mtime > outstats.ctime )
			{
				sass.renderFile({
					file: infile, outFile: outfile,
					imagePath: '/static/img',
					outputStyle: 'compressed',
					success: function(){
						global.log('Compile successful:', item);
						cb();
					},
					error: function(err){
						global.error('Compile FAILED:', item);
						global.log(err);
						cb(err);
					}
				});
			}
			else {
				global.log('File', item, 'unmodified, skipping.');
				cb();
			}
		}
		else {
			cb();
		}
	}

	// read all the files in the sass template directory
	fs.readdir( libpath.resolve(__dirname, '../templates/sass'), function(err,files)
	{
		if(err){
			global.error('Could not open Sass template directory!', err);
			return;
		}

		// compile each file, run callback on successful completion
		async.eachLimit(files, 4, compile, function(err)
		{
			if(err){
				global.error('Failed to compile Sass templates!', err);
			}
			else {
				global.log('Sass templates compiled successfully.');
				callback();
			}
		});
	});
}

exports.compile = compileSCSS;
