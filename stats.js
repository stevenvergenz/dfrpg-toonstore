var mysql = require('mysql'),
	global = require('./global.js');

function serveStats(req,res,next)
{
	var query =
		"SELECT reg1.count as regCount1, reg7.count as regCount7, reg30.count as regCount30, regall.count as regCountAll, "+
			"login1.count as loginCount1, login7.count as loginCount7, login30.count as loginCount30, loginall.count as loginCountAll, "+
			"char1.count as charCount1, char7.count as charCount7, char30.count as charCount30, charall.count as charCountAll, "+
			"edit1.count as editCount1, edit7.count as editCount7, edit30.count as editCount30, editall.count as editCountAll "+
		"FROM "+
			"(SELECT COUNT(*) as count FROM Users WHERE registered >= ?) as reg1, "+
			"(SELECT COUNT(*) as count FROM Users WHERE registered >= ?) as reg7, "+
			"(SELECT COUNT(*) as count from Users WHERE registered >= ?) as reg30, "+
			"(SELECT COUNT(*) as count from Users) as regall, "+

			"(SELECT COUNT(*) as count FROM Users WHERE last_login >= ?) as login1, "+
			"(SELECT COUNT(*) as count FROM Users WHERE last_login >= ?) as login7, "+
			"(SELECT COUNT(*) as count from Users WHERE last_login >= ?) as login30, "+
			"(SELECT COUNT(*) as count from Users WHERE last_login != registered) as loginall, "+

			"(SELECT COUNT(*) as count FROM Characters WHERE created_on >= ?) as char1, "+
			"(SELECT COUNT(*) as count FROM Characters WHERE created_on >= ?) as char7, "+
			"(SELECT COUNT(*) as count from Characters WHERE created_on >= ?) as char30, "+
			"(SELECT COUNT(*) as count from Characters) as charall, "+

			"(SELECT COUNT(*) as count FROM Characters WHERE last_updated >= ?) as edit1, "+
			"(SELECT COUNT(*) as count FROM Characters WHERE last_updated >= ?) as edit7, "+
			"(SELECT COUNT(*) as count from Characters WHERE last_updated >= ?) as edit30, "+
			"(SELECT COUNT(*) as count from Characters WHERE last_updated != created_on) as editall"+
		";";

	var yesterday = new Date(Date.now()-1000*3600*24);
	var lastWeek = new Date(Date.now()-1000*3600*24*7);
	var lastMonth = new Date(Date.now()-1000*3600*24*30);

	var args = [
		yesterday, lastWeek, lastMonth,
		yesterday, lastWeek, lastMonth,
		yesterday, lastWeek, lastMonth,
		yesterday, lastWeek, lastMonth
	];

	var connection = mysql.createConnection( global.config.database );
	connection.query(query, args, function(err,rows,fields)
	{
		if(err){
			global.error( err, global.logLevels.warning );
			res.send(500);
		}
		else {
			global.log('Serving stats page');
			global.renderPage('stats', rows[0])(req,res);
		}

		connection.end();
	});
}

exports.serveStats = serveStats;
