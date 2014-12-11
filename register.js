var fs = require('fs');
var libpath = require('path');
var mysql = require('mysql');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var jade = require('jade');

var global = require('./global.js');
var config = require('./config.json');

function register(req,res)
{
	var token = crypto.pseudoRandomBytes(16).toString('hex');

	var connection = mysql.createConnection( config.database );
	connection.query('INSERT INTO Users SET email = ?, username = ?, registered = NOW();', [req.body.email, req.body.username],
		function(err,rows,fields)
		{
			if(err){
				global.error('Failed to add new user to DB!', err);
				global.renderPage('register', {message: {type:'error', content:'That email is already registered.'}})(req,res);
				connection.end();
			}
			else {
				connection.query('DELETE FROM Tokens WHERE email = ?;', [req.body.email]);
				connection.query(
					'INSERT INTO Tokens SET email = ?, token = ?, expires = ADDTIME(NOW(), "00:15:00");',
					[req.body.email, token],
					function(err,rows,fields)
					{
						if( err ){
							global.error('Failed to register pass reset token.', err);
							global.renderPage('index', {message: {type:'error', content:'Unidentified database error'}})(req,res);
						}
						else
						{
							// send out confirmation email
							global.log('Sent out password token:', token);
							var transporter = nodemailer.createTransport(config.smtp);
							transporter.sendMail({
								from: 'no-reply@toonstore.net',
								to: req.body.email,
								subject: 'Verify your account - ToonStore.net',
								html: jade.renderFile( libpath.resolve(__dirname, 'templates/activate-email.jade'), {
									registration: true,
									url: config.persona_audience,
									token: token,
									username: req.body.username
								})
							});
								
							global.renderPage('activation', {})(req,res);

						}
						connection.end();
					}
				);
			}
		}
	);

}
	/*crypto.randomBytes(32, function(ex,buf)
	{
		if(ex){
			global.error('Could not create new salt!', ex);
			global.renderPage('register', {message: {type:'error', content:err}})(req,res);
			return;
		}

		var salt = buf.toString('hex');
		var hash = crypto.createHash('sha256');
		var passHash = hash.update(salt+req.body.password, 'utf8').digest('hex');*/

		/*connection.query(
			'INSERT INTO Users SET username = ?, email = ?, registered = NOW(), last_login = NOW(), password = ?, salt = ?;',
			[req.body.username, req.body.email, passHash, salt],
			function(err, rows, fields)
			{
				if(err){
					global.error('Failed to add new user to DB!', err);
					global.renderPage('register', {message: {type:'error', content:'That email is already registered.'}})(req,res);
				}
				else {
					global.log('New user registered:', req.body.username);
					req.session.user = req.body.username;
					req.session.user_email = req.body.email;
					req.session.persona = false;
					res.redirect('/post-register');
				}
				connection.end();
			}
		);*/

function federatedRegister(req,res)
{
	var body = req.body;
	if( ['register', 'post-register', 'newtoon', 'killtoon', 'site'].indexOf(body.username) != -1 ){
		global.error('Registration error: cannot register reserved word');
		global.renderPage('register', {message: {type:'warning', content:'That username is reserved, choose another.'}})(req,res);
		return;
	}
	else if( !/^[A-Za-z_-]+$/.test(body.username) ){
		global.error('Registration error: cannot register invalid username');
		global.renderPage('register', {message: {type:'warning', content:'That username is invalid, choose another.'}})(req,res);
		return;
	}
	else if( !req.session.user_email ){
		global.error('Registration error: did not log in first');
		global.renderPage('register', {message: {type:'warning', content:'You must sign in before attempting to choose a username.'}})(req,res);
		return;
	}
	global.log('Registering user:', body.username);

	// connect to the db
	var connection = mysql.createConnection( config.database );
	connection.query(
		'INSERT INTO Users SET username = ?, email = ?, registered = NOW(), last_login = NOW();', 
		[body.username,req.session.user_email],
		function(err, rows, fields){
			if( err ){
				global.error('Registration error:', err, global.logLevels.error);
				global.renderPage('register', {message: {type:'error', content:err}})(req,res);
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
	if( ['register', 'post-register', 'newtoon', 'killtoon', 'site'].indexOf(user) != -1 ){
		res.json(200, {found: true});
		return;
	}

	// connect to the db
	var connection = mysql.createConnection( config.database );
	connection.query('SELECT COUNT(username) AS userCount FROM Users WHERE username = ?', [user], function(err, rows, fields)
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

