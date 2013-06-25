var libpath = require('path');
var mysql = require('mysql');

var global = require('./global.js');

function newCharacterPage(req,res)
{
	if( req.session.user ){
		global.log('Serving new character page');
		var params = {page: req.url, logged_user: req.session.user};
		res.render('newtoon', params);
	}
	else {
		res.redirect('/login?redir=/newtoon');
	}
}

function newCharacterRequest(req,res)
{
	global.log('Attempting character creation');
	var connection = mysql.createConnection( global.config.database );
	connection.query('INSERT INTO Characters SET created_on=NOW(), ?;',
		{'canonical_name': req.body.canon_name, 'name': req.body.name,
			'owner': req.session.user, 'concept': req.body.concept},
		function(err,rows,fields)
		{
			if( err ){
				global.error('MySQL error:', err);
				var params = {page: req.url, logged_user: req.session.user, 
					message: 'You are already using that short name'};
				res.render('newtoon', params);
			}
			else {
				global.log('Creation successful');
				var url = '/'+req.session.user+'/'+req.body.canon_name;
				res.redirect(url);
			}
		}
	);
}

exports.newCharacterPage = newCharacterPage;
exports.newCharacterRequest = newCharacterRequest;

