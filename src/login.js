var libpath = require('path');
var mysql = require('mysql');
var liburl = require('url');
var fs = require('fs');
var https = require('https');
var querystring = require('querystring');
var crypto = require('crypto');

var global = require('./global.js');
var config = require('../config.json');


function processLogin(req,res)
{
	global.log('Native login attempt');

	var email = req.body.email, password = req.body.password;

	setTimeout(continued, 2000);

	function continued()
	{
		var connection = mysql.createConnection( config.database );
		connection.query('SELECT username,salt FROM Users WHERE BINARY email = ?', [email], function(err,rows,fields)
		{
			if(err){
				global.error('Error querying db:', err);
				global.renderPage('login', {code: 500, message: {type:'error', content: res.i18n.__('server.genericErr')}})(req,res);
				connection.end();
			}
			else if(rows.length === 0){
				global.log('Email not found:', email);
				global.renderPage('login', {code: 401, message: {type:'error', content: res.i18n.__('server.loginErr')}})(req,res);
				connection.end();
			}
			else
			{
				var username = rows[0].username;
				var hashfn = crypto.createHash('sha256');
				var hash = hashfn.update(rows[0].salt+password, 'utf8').digest('hex');

				connection.query('UPDATE Users SET last_login = NOW() WHERE BINARY email = ? AND password = ?', [email, hash],
					function(err,result)
					{
						if(err){
							global.error('Error updating db:', err);
							global.renderPage('login', {code: 500, message: {type:'error', content: res.i18n.__('server.genericErr')}})(req,res);
						}
						else if( result.affectedRows === 0 ){
							global.log('Incorrect password for:', email);
							global.renderPage('login', {code: 401, message: {type:'error', content: res.i18n.__('server.loginErr')}})(req,res);
						}
						else {
							global.log('User logged in:', email);
							connection.query('DELETE FROM Tokens WHERE BINARY email = ?;', [email]);
							req.session.user = username;
							req.session.user_email = email;
							req.session.persona = false;
							if(req.query.redirect)
								res.redirect(req.query.redirect);
							else
								res.redirect('/'+username);
						}
						connection.end();
					}
				);
			}
		});
	}
}


function processPersonaLogin(req,res)
{
	global.log('Persona login attempt');
	
	var options = {
		'host': 'verifier.login.persona.org',
		'path': '/verify',
		'method': 'POST'
	};

	// set up the verification AJAX request
	var verifyReq = https.request(options, function(vres)
	{
		var body = '';
		vres.on('data', function(chunk){
			body += chunk;
		});
		vres.on('end', function()
		{
			try {
				var verifyResp = JSON.parse(body);
			}
			catch(e){
				global.log('Verifier response is non-JSON');
				res.send('Bad response from verifier', 403);
			}

			if( verifyResp && verifyResp.status == 'okay' ){
				global.log('Email verified: ', verifyResp.email);
				logInVerifiedEmail(req,res, verifyResp.email);
			}
			else {
				global.log('Failed to verify email: ', verifyResp.reason);
				res.send(verifyResp.reason, 403);
			}
		});
	});

	// actually make the verification request
	var data = querystring.stringify({
		'assertion': req.body.email,
		'audience': config.origin
	});
	verifyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
	verifyReq.setHeader('Content-Length', data.length);
	verifyReq.write(data);
	verifyReq.end();
}

function logInVerifiedEmail(req,res,email)
{
	// save email to session
	req.session.user_email = email;

	// look up corresponding username
	var connection = mysql.createConnection( config.database );
	connection.query('SELECT username FROM Users WHERE BINARY email = ?;', [email],
		function(err,rows,fields){
			if( err ){
				global.error('MySQL error:', err);
				res.json(500, {status: 'error', type: 'message', content: {type: 'error', content:err}} );
			}
			else if( rows.length == 0 ){
				global.error('Login error: no such email');
				res.json(307, {status: 'error', type: 'redirect', content: '/federated-register'});
			}
			else {
				global.log('Login successful');
				connection.query('UPDATE Users SET last_login = NOW() WHERE BINARY username = ?;', [rows[0].username]);
				req.session.user = rows[0].username;
				req.session.persona = true;
				res.json(200, {status: 'OK', username: rows[0].username} );
			}

			connection.end();
			return;
		}
	);
}


function processLogout(req,res)
{
	global.log('Logging out user', req.session.user);
	delete req.session.user;
	delete req.session.user_email;
	res.send(200);
}


exports.processLogin = processLogin;
exports.processPersonaLogin = processPersonaLogin;
exports.processLogout = processLogout;

