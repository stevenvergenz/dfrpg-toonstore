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
			global.renderPage('index', {code: 500, message: {type:'error', content: res.i18n.__('server.genericErr')}})(req,res);
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
		'INSERT INTO Tokens SET email = ?, token = ?, expires = ADDTIME(NOW(), "00:15:00");',
		[req.body.email, token],
		function(err,result)
		{
			if( err ){
				global.error('Failed to register pass reset token.', err);
				global.renderPage('index', {code:500, message: {type:'error', content: res.i18n.__('server.genericErr')}})(req,res);
			}
			else
			{
				global.log('Sent out password token:', token);
				global.renderActivationEmail(req.body.email, req.body.username, token, false, res.i18n);
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
			global.renderPage('activation', {code:500, message: {type:'error', content: res.i18n.__('server.genericErr')}})(req,res);
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
					global.renderPage('activation', {code: 500, message: {type:'error', content:res.i18n.__('server.genericErr')}})(req,res);
				}
				else if(result.affectedRows === 0){
					global.error('Token not found or expired');
					next();
				}
				else {
					global.log('Password reset for token', req.params.token);
					req.session.latent_message = res.i18n.__('server.passwordSet');
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

