var mysql = require('mysql');

var global = require('./global.js');

function servePage(req,res,next)
{
	var connection = mysql.createConnection( global.config.database );
	connection.query(
		'SELECT name FROM Characters WHERE owner = ? AND canonical_name = ?;',
		[req.params.user, req.params.char],
		function(err,rows,fields){
			if( !err && rows.length == 1 ){
				global.log('Serving character page for', req.url);
				var pageFields = {'page': req.url, 'logged_user': req.session.user, 'owner': req.params.user};
				pageFields.toonName = rows[0].name;
				res.render('charsheet', pageFields);
			}
			else {
				next();
			}
			connection.end();
		}
	);
}

function serveJson(req,res,next)
{
	var connection = mysql.createConnection( global.config.database );
	connection.query(
		'SELECT info FROM Characters WHERE owner = ? AND canonical_name = ?;',
		[req.params.user, req.params.char],
		function(err,rows,fields){
			if( !err && rows.length == 1 ){
				global.log('Serving character JSON for', req.url);
				res.json(200, JSON.parse(rows[0].info));
			}
			else {
				next();
			}
			connection.end();
		}
	);
}

function pushJson(req,res,next)
{
	// don't update if incorrect user is logged in
	if( req.session.user != req.params.user ){
		res.send(403, '403 forbidden');
		return;
	}

	global.log('Attempting to update character sheet of', req.params.char);

	var connection = mysql.createConnection( global.config.database );
	connection.query(
		'UPDATE Characters SET info = ? WHERE owner = ? AND canonical_name = ?;',
		[req.body, req.params.user, req.params.char],
		function(err,rows,fields){
			if( !err ){
				global.log('Success');
				res.send(200);
			}
			else {
				next();
			}
			connection.end();
		}
	);
}

exports.servePage = servePage;
exports.serveJson = serveJson;
exports.pushJson = pushJson;

