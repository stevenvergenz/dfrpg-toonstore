var mysql = require('mysql'),
	crypto = require('crypto'),
	fs = require('fs'),
	libpath = require('path'),
	nodemailer = require('nodemailer'),
	jade = require('jade'),

	global = require('./global.js'),
	config = require('../config.json');


function serveActivationPage(req,res,next)
{
	var connection = mysql.createConnection(config.database);
	connection.query('SELECT COUNT(*) AS count FROM Tokens WHERE token = ? AND expires > NOW();', [req.params.token], function(err,rows,fields)
	{
		if(err){
			global.error('Cannot query Tokens table', err);
			global.renderPage('404', {code: 500, message: {type:'error',content:'An unidentified error has occurred, please contact the site admin.'}})(req,res);
		}
		else if( rows[0].count === 0 ){
			next();
		}
		else {
			global.renderPage('activation')(req,res);
		}

		connection.end();
	});
}

function passwordReset(req,res,next)
{
	var token = crypto.pseudoRandomBytes(16).toString('hex');

	var connection = mysql.createConnection( config.database );
	connection.query('DELETE FROM Tokens WHERE BINARY email = ?;', [req.body.email]);
	connection.query(
		'INSERT INTO Tokens SET email = (SELECT email FROM Users WHERE BINARY email = ?), token = ?, expires = ADDTIME(NOW(), "00:20:00");',
		[req.body.email, token],
		function(err,result)
		{
			if( err ){
				global.error('Failed to register pass reset token. No such email?', err);
				global.renderPage('index', {message: {type:'error', content:'That email address is not registered.'}})(req,res);
			}
			else
			{
				// build email message
				var template = jade.compile( fs.readFileSync(libpath.resolve(__dirname, '../templates/activate-email.jade')) );
				var html = template({
					registration: false,
					url: config.origin,
					token: token,
					username: req.body.username
				});

				// send out confirmation email
				global.log('Sent out password token:', token);
				var transporter = nodemailer.createTransport(config.smtp);
				transporter.sendMail({
					from: 'no-reply@toonstore.net',
					to: req.body.email,
					subject: 'Reset your password - ToonStore.net',
					html: html
				});
								
				res.redirect('/pre-activate');

			}
			connection.end();
		}
	);
}


function setPassword(req,res,next)
{
	crypto.randomBytes(32, function(ex,buf)
	{
		if(ex){
			global.error('Could not create new salt!', ex);
			global.renderPage('activation', {message: {type:'error', content:err}})(req,res);
			return;
		}

		var salt = buf.toString('hex');
		var hash = crypto.createHash('sha256');
		var passHash = hash.update(salt+req.body.password, 'utf8').digest('hex');

		var connection = mysql.createConnection( config.database );
		connection.query(
			'UPDATE Users SET password = ?, salt = ? WHERE BINARY email = (SELECT email FROM Tokens WHERE token = ? AND expires > NOW());',
			[passHash, salt, req.params.token],
			function(err, result)
			{
				if(err){
					global.error('Failed to set password!', err);
					global.renderPage('activation', {code: 500, message: {type:'error',content:'An unidentified error has occurred, please contact the site admin.'}})(req,res);
				}
				else if(result.affectedRows === 0){
					global.error('Token not found or expired');
					next();
				}
				else {
					global.log('Password reset for token', req.params.token);
					req.session.latent_message = 'Your password has been set. Please log in to continue.';
					res.redirect('/login');
				}
				connection.end();
			}
		);
	});

}

exports.serveActivationPage = serveActivationPage;
exports.passwordReset = passwordReset;
exports.setPassword = setPassword;

