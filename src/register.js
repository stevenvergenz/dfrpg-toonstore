var fs = require('fs');
var libpath = require('path');
var mysql = require('mysql');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var jade = require('jade');

var global = require('./global.js');
var config = require('../config.json');


var blacklist = ['register', 'post-register', 'federated-register', 'activate', 'pre-activate', 'login', 'logout', 'newtoon', 'killtoon', 'site'];


function register(req,res)
{
	var token = crypto.pseudoRandomBytes(16).toString('hex');

	if( blacklist.indexOf(req.body.username) != -1 ){
		global.error('Registration error: cannot register reserved word');
		global.renderPage('register', {code: 403, message: {type:'warning', content: res.i18n.__('server.userReserved')}})(req,res);
		return;
	}
	else if( !/^[A-Za-z0-9_-]+$/.test(req.body.username) ){
		global.error('Registration error: cannot register invalid username');
		global.renderPage('register', {code: 403, message: {type:'warning', content: res.i18n.__('server.userInvalid')}})(req,res);
		return;
	}
	global.log('Registering user:', req.body.username);


	var connection = mysql.createConnection( config.database );
	connection.query('INSERT INTO Users SET email = ?, username = ?, registered = NOW();', [req.body.email, req.body.username],
		function(err,result)
		{
			if(err){
				global.error('Failed to add new user to DB!', err);
				global.renderPage('register', {code: 401, message: {type:'error', content: res.i18n.__('server.emailTaken')}})(req,res);
				connection.end();
			}
			else {
				connection.query('DELETE FROM Tokens WHERE BINARY email = ?;', [req.body.email]);
				connection.query(
					'INSERT INTO Tokens SET email = ?, token = ?, expires = ADDTIME(NOW(), "00:15:00");',
					[req.body.email, token],
					function(err2,result2)
					{
						if( err2 ){
							global.error('Failed to register pass reset token.', err2);
							global.renderPage('index', {message: {type:'error', content: res.i18n.__('server.genericErr')}})(req,res);
						}
						else
						{
							global.log('Sent out password token:', token);
							global.renderActivationEmail(req.body.email, req.body.username, token, true, res.i18n);
							res.redirect('/pre-activate?t=register');
						}
						connection.end();
					}
				);
			}
		}
	);

}


function federatedRegister(req,res)
{
	var body = req.body;
	if( blacklist.indexOf(body.username) != -1 ){
		global.error('Registration error: cannot register reserved word');
		global.renderPage('register', {code: 403, message: {type:'warning', content:'That username is reserved, choose another.'}})(req,res);
		return;
	}
	else if( !/^[A-Za-z0-9_-]+$/.test(body.username) ){
		global.error('Registration error: cannot register invalid username');
		global.renderPage('register', {code: 403, message: {type:'warning', content:'That username is invalid, choose another.'}})(req,res);
		return;
	}
	else if( !req.session.user_email ){
		global.error('Registration error: did not log in first');
		global.renderPage('register', {code: 401, message: {type:'warning', content:'You must sign in before attempting to choose a username.'}})(req,res);
		return;
	}
	global.log('Registering user:', body.username);

	// connect to the db
	var connection = mysql.createConnection( config.database );
	connection.query(
		'INSERT INTO Users SET username = ?, email = ?, registered = NOW(), last_login = NOW();', 
		[body.username,req.session.user_email],
		function(err, result){
			if( err ){
				global.error('Registration error:', err, global.logLevels.error);
				global.renderPage('register', {code: 500, message: {type:'error', content: res.i18n.__('server.genericErr')}})(req,res);
			}
			else {
				global.log('Registration successful');
				req.session.user = body.username;
				req.session.persona = true;
				res.redirect('/post-register');
			}
			connection.end();
		}
	);
}

// username testing
function checkUsername(req,res)
{
	var user = req.query.a;

	// test for reserve words
	if( blacklist.indexOf(user) != -1 ){
		res.json(200, {found: true});
		return;
	}

	// connect to the db
	var connection = mysql.createConnection( config.database );
	connection.query('SELECT COUNT(username) AS userCount FROM Users WHERE BINARY username = ?', [user], function(err, rows, fields)
	{
		if( err ){
			global.error('MySQL error:', err);
			res.send(500, 'MySQL error');
		}
		else {
			var userFound = rows[0]["userCount"] == 1;
			res.json(200, {found: userFound});
		}
		connection.end();
	});
}

exports.register = register;
exports.federatedRegister = federatedRegister;
exports.checkUsername = checkUsername;

