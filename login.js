var libpath = require('path');
var mysql = require('mysql');
var liburl = require('url');
var fs = require('fs');
var crypto = require('crypto');

var global = require('./global.js');


function loginPage(req,res)
{
	global.log('Serving login page');
	res.sendfile( libpath.normalize('./public/login.html') );
}

function processLogin(req,res)
{
	global.log('Attempting login:', req.body.email);

	var connection = mysql.createConnection( global.config.database );
	connection.query('SELECT username, HEX(password) AS password, HEX(salt) AS salt FROM Users WHERE email = ?;', [req.body.email],
		function(err,rows,fields){
			console.log(rows);
			if( err ){
				global.error('MySQL error:', err);
				res.redirect('/login');
			}
			else if( rows.length == 0 ){
				global.error('Login error: no such email');
				res.redirect('/login');
			}

			// salt/hash the input password
			var inputPass = crypto.pbkdf2Sync(req.body.password, new Buffer(rows[0].salt, 'hex'), 1000, 32);

			if( inputPass.toString('hex').toUpperCase() == rows[0].password ){
				global.log('Login successful');
				res.redirect('/'+rows[0].username);
			}
			else {
				global.log('Login error: incorrect password');
				global.log(inputPass.toString('hex'));
				res.redirect('/login');
			}
		}
	);
}

exports.loginPage = loginPage;
exports.processLogin = processLogin;

