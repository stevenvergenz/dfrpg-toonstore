var mysql = require('mysql');
var libpath = require('path');
var fs = require('fs');

var global = require('./global.js');
var config = require('../config.json');

var filename = process.argv[2];
var file = JSON.parse(fs.readFileSync(filename));

var connection = mysql.createConnection( config.database );
connection.query('UPDATE Characters SET info = ? WHERE BINARY canonical_name = "asdf" AND BINARY owner = "Derogatory";', [JSON.stringify(file)],
	function(err,rows,fields){
		if(err){
			console.log(err);
		}
		else {
			console.log(rows.message);
			console.log('Success');
		}
		connection.end();
	}
);
