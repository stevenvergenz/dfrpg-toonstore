var lxml = require('libxmljs'),
	mysql = require('mysql'),
	liburl = require('url'),
	global = require('./global.js');
var config = require('./config.json');


// generate a sitemap
function serveSitemap(req,res,next)
{
	// don't generate if admin disables it
	if( !config.use_sitemap )
		res.send(404);

	// create sitemap template
	var doc = lxml.Document();
	doc.node('urlset').attr({
		'xmlns': "http://www.sitemaps.org/schemas/sitemap/0.9",
		'xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
		'xsi:schemaLocation': "http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
	});

	var root = doc.root();
	root.node('url').node('loc', liburl.resolve(config.persona_audience, '/'))
		.parent().node('priority', '1.0');
	root.node('url').node('loc', liburl.resolve(config.persona_audience, '/site/about'))
		.parent().node('priority', '0.8');
	root.node('url').node('loc', liburl.resolve(config.persona_audience, '/site/contact'));
	root.node('url').node('loc', liburl.resolve(config.persona_audience, '/site/terms'));
	root.node('url').node('loc', liburl.resolve(config.persona_audience, '/site/privacy'));

	// generate sitemap for user/character URLs
	var connection = mysql.createConnection( config.database );
	connection.query(
		'SELECT CONCAT("/",owner,"/",canonical_name,"/") AS url, last_updated FROM Characters WHERE private = false '+
		'UNION SELECT CONCAT("/",username) AS url, last_login AS last_updated FROM Users ORDER BY url;',
		function(err,rows,fields)
		{
			if(err){
				global.error('MySQL error:', err);
				res.send(500);
				return;
			}

			for(var i in rows)
			{
				// format date correctly
				var date = null;
				if( rows[i].last_updated ){
					date = rows[i].last_updated;
					date = date.getFullYear() + '-' + ('00'+(date.getMonth()+1)).slice(-2) + '-' + ('00'+date.getDate()).slice(-2);
				}

				// add url entry
				var newurl = root.node('url');
				newurl.node('loc', liburl.resolve(config.persona_audience, rows[i].url));
				if(date)
					newurl.node('lastmod', date);
			}

			// return generated xml document
			res.set('Content-Type', 'text/xml');
			res.send(doc.toString());
			connection.end();
		}
	);
}

exports.serve = serveSitemap;
