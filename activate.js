var mysql = require('mysql'),
	crypto = require('crypto'),
	global = require('./global.js'),
	config = require('./config.json');


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
			'UPDATE Users SET password = ?, salt = ? WHERE email = (SELECT email FROM Tokens WHERE token = ? AND expires > NOW());',
			[passHash, salt, req.params.token],
			function(err, result)
			{
				if(err){
					global.error('Failed to set password!', err);
					global.renderPage('404', {code: 500, message: {type:'error',content:'An unidentified error has occurred, please contact the site admin.'}})(req,res);
				}
				else if(result.affectedRows === 0){
					global.error('Token not found or expired');
					next();
				}
				else {
					global.log('Password reset for token', req.params.token);
					res.redirect('/login');
				}
				connection.end();
			}
		);
	});

}

exports.serveActivationPage = serveActivationPage;
exports.setPassword = setPassword;

