var mysql = require('mysql'),
	fs = require('fs'),
	libpath = require('path'),
	gm = require('gm'),
	child_process = require('child_process');

var config = require('../config.json'),
	global = require('./global.js');

// clean up the avatars folder on a regular basis
function spawnChild()
{
	var janitor = child_process.fork( libpath.resolve(__dirname,'clean-avatars.js'), {
		silent: true
	});

	var logfile = fs.createWriteStream(libpath.resolve(__dirname,'..','janitor.log'), {flags: 'a'});
	janitor.stdout.on('data', function(chunk){
		logfile.write(chunk);
	});
	janitor.stdout.on('end', function(){
		logfile.end();
	});
}
spawnChild();
setInterval(spawnChild, 12*60*60*1000);

function serveAvatar(req,res,next)
{
	var connection = mysql.createConnection(config.database);
	connection.query('SELECT avatar FROM Characters WHERE BINARY owner = ? AND BINARY canonical_name = ? AND (private=FALSE OR BINARY owner = ?);',
		[req.params.user, req.params.char, req.session.user],
		function(err,info)
		{
			if(err){
				global.error('MySQL error:', err);
				next();
			}
			else if(info.length == 0){
				global.log('Character missing, or avatar is private');
				res.send(404);
			}
			else if(!info[0].avatar){
				global.log('Avatar not found');
				res.send(404);
			}
			else {
				res.sendfile( libpath.resolve(__dirname, '..','uploads', info[0].avatar) );
			}
			connection.end();
		}
	);
}

function saveAvatar(req,res,next)
{
	if( !(req.session && req.session.user) ){
		res.send(401);
		return;
	}

	// scale down to what will fit in the avatar box
	var newFile = req.files.avatar.path;

	gm(newFile).size(function(err,size){
		if(!err){
			var factor = size.width>size.height ? 350/size.width : 196/size.height;
			gm(newFile)
				.resize( size.width*factor, size.height*factor )
				.write(newFile, function(err){
					if(err){
						global.error(err);
						res.send(500);
					}
					else {
						updateAvatar();
					}
				});
		}
		else {
			global.log(err);
			fs.unlink(newFile);
			res.send(400);
		}
	});

	function updateAvatar()
	{
		var connection = mysql.createConnection(config.database);
		var filename = libpath.basename(newFile);

		connection.query('UPDATE Characters SET avatar = ? WHERE BINARY owner = ? AND BINARY canonical_name = ?;',
			[filename, req.session.user, req.params.char],
			function(err,result)
			{
				if(err){
					global.error('MySQL error:', err);
					res.send(500);
				}
				else if(result.affectedRows == 0){
					global.log('Avatar not found');
					res.send(404);
				}
				else {
					global.log('Avatar saved');
					res.send(200);
				}
				connection.end();
			}
		);
	}
}

exports.serveAvatar = serveAvatar;
exports.saveAvatar = saveAvatar;

