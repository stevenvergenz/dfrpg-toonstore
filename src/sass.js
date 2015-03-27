var fs = require('fs'),
	libpath = require('path'),
	sass = require('node-sass'),
	async = require('async'),
	
	global = require('./global.js');


function compileSCSS(dir, callback)
{
	/*
	 * function to compile each file, used as a callback to the async call
	 */
	function compile(item, cb)
	{
		var infile = libpath.resolve(__dirname, dir, item);
		var instats = null;

		// get the stats for the scss template
		try {
			instats = fs.statSync(infile);
		}
		catch(e){
			global.error('Cannot stat input file', infile);
			cb(e);
			return;
		}

		var match = /^([^_][\w]*)\.scss$/.exec(item);
		if( match )
		{
			var outfile = libpath.resolve(__dirname, dir, match[1]+'.css');

			/*var outstats;
			try {
				outstats = fs.statSync(outfile);
			}
			catch(e){
				outstats = null;
			}
			if( !outstats || instats.mtime > outstats.ctime )
			{*/

			sass.render({
				file: infile,
				imagePath: '/static/img',
				outputStyle: 'nested',

				sourceMap: true,
				outFile: outfile,

				success: function(result)
				{
					fs.writeFile(outfile+'.map', JSON.stringify(result.map), function(err)
					{
						if(err){
							global.error('Could not output source map to file', outfile+'.map');
						}
					});

					fs.writeFile(outfile, result.css, function(err)
					{
						if(err){
							global.error('Could not output to file', outfile);
							cb(err);
						}
						else {
							global.log('Compile successful:', infile);
							cb();
						}
					});
				},
				error: function(err){
					global.error('Compile FAILED:', infile);
					global.error(err);
					cb(err);
				}
			});

			/*}
			else {
				global.log('File', item, 'unmodified, skipping.');
				cb();
			}*/
		}
		else if( instats.isDirectory() )
		{
			compileSCSS(infile, cb);
		}
		else {
			cb();
		}
	}

	// read all the files in the sass template directory
	var indir = libpath.resolve(__dirname, dir)
	fs.readdir( indir, function(err,files)
	{
		if(err)
		{
			global.error('Could not open directory!', err);
			callback(err);
		}
		else
		{
			// compile each file, run callback on successful completion
			async.eachSeries(files, compile, function(err)
			{
				if(err){
					callback(err);
				}
				else {
					callback();
				}
			});
		}
	});
}

exports.compile = compileSCSS;
