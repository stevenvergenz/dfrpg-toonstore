var mysql = require('mysql');
var libpath = require('path');
var fs = require('fs');

var global = require('./global.js');


var filename = process.argv[2];
var file = JSON.parse(fs.readFileSync(filename));

var connection = mysql.createConnection( global.config.database );
connection.query('UPDATE Characters SET info = ? WHERE canonical_name = "dresden";', [JSON.stringify(file)],
	function(err,rows,fields){
		if(err){
			console.log(err);
		}
		else {
			console.log('Success');
		}
	}
);
connection.end();
