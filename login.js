var libpath = require('path');
var mysql = require('mysql');
var liburl = require('url');
var fs = require('fs');
var crypto = require('crypto');
var https = require('https');
var querystring = require('querystring');

var global = require('./global.js');


function processLogin(req,res)
{
	global.log('Attempting login:', req.body.email);

	var connection = mysql.createConnection( global.config.database );
	connection.query('SELECT username, HEX(password) AS password, HEX(salt) AS salt FROM Users WHERE email = ?;', [req.body.email],
		function(err,rows,fields){
			if( err ){
				global.error('MySQL error:', err);
				global.renderPage('login', {message: {type: 'error', content:err}})(req,res);
				connection.end();
				return;
			}
			else if( rows.length == 0 ){
				global.error('Login error: no such email');
				global.renderPage('login', {message: {type: 'error', content:'Invalid email or password'}})(req,res);
				connection.end();
				return;
			}

			// salt/hash the input password
			var inputPass = crypto.pbkdf2Sync(req.body.password, new Buffer(rows[0].salt, 'hex'), 1000, 32);

			if( inputPass.toString('hex').toUpperCase() == rows[0].password ){
				global.log('Login successful');
				connection.query('UPDATE Users SET last_login = NOW() WHERE username = ?;', [rows[0].username]);
				req.session.user = rows[0].username;
				if( req.body.redir )
					res.redirect(req.body.redir);
				else
					res.redirect('/'+rows[0].username);
			}
			else {
				global.log('Login error: incorrect password');
				global.renderPage('login', {message: {type: 'error', content:'Invalid email or password'}})(req,res);
			}
			connection.end();
		}
	);
}

function processPersonaLogin(req,res)
{
	global.log('Login attempt');
	
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
		'audience': global.config.persona_audience
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
	var connection = mysql.createConnection( global.config.database );
	connection.query('SELECT username FROM Users WHERE email = ?;', [email],
		function(err,rows,fields){
			if( err ){
				global.error('MySQL error:', err);
				res.json(500, {status: 'error', type: 'message', content: {type: 'error', content:err}} );
			}
			else if( rows.length == 0 ){
				global.error('Login error: no such email');
				res.json(307, {status: 'error', type: 'redirect', content: '/register'});
			}
			else {
				global.log('Login successful');
				req.session.user = rows[0].username;
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


exports.processLogin = processPersonaLogin;
exports.processLogout = processLogout;

