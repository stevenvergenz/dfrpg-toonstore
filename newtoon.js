var libpath = require('path');
var mysql = require('mysql');

var global = require('./global.js');

function newCharacterPage(req,res)
{
	if( req.session.user ){
		req.render('newtoon');
	}
	else {
		req.redirect('/login');
	}
}

function newCharacterRequest(req,res)
{
	
}

exports.newCharacterPage = newCharacterPage;
exports.newCharacterRequest = newCharacterRequest;

