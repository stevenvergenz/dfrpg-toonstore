var lxml = require('libxmljs'),
	mysql = require('mysql'),
	liburl = require('url'),
	global = require('./global.js');
var config = require('../config.json');


// generate a sitemap
function serveSitemap(req,res,next)
{
	// don't generate if admin disables it
	if( !config.use_sitemap )
		return next();

	// create sitemap template
	var doc = lxml.Document();
	doc.node('urlset').attr({
		'xmlns': "http://www.sitemaps.org/schemas/sitemap/0.9",
		'xmlns:xhtml': "http://www.w3.org/1999/xhtml",
		'xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
		'xsi:schemaLocation': "http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
	});

	var root = doc.root();
	var locales = [''].concat(res.i18n.config.locales);

	var urls = [{
		'loc': '/',
		'priority': '1.0'
	}, {
		'loc': '/site/about',
		'priority': '0.8'
	}, {
		'loc': '/site/donate',
		'priority': '0.8'
	}, {
		'loc': '/site/contact',
		'priority': '0.8'
	}];

	/*for( var i=0; i<locales.length; i++ )
	{
		root.node('url').node('loc', liburl.resolve(config.origin, locales[i]+'/'))
			.parent().node('priority', '1.0');
		root.node('url').node('loc', liburl.resolve(config.origin, locales[i]+'/site/about'))
			.parent().node('priority', '0.8');
		root.node('url').node('loc', liburl.resolve(config.origin, locales[i]+'/site/donate'))
			.parent().node('priority', '0.8');
		root.node('url').node('loc', liburl.resolve(config.origin, locales[i]+'/site/contact'))
			.parent().node('priority', '0.8');
	}*/

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
				var newurl = {'loc': rows[i].url};
				if(date)
					newurl.lastmod = date;
				urls.push(newurl);
			}

			// generate xml document from gathered URLs
			for(var pathlang=0; pathlang<locales.length; pathlang++)
			{
				for(var i=0; i<urls.length; i++)
				{
					var newurl = root.node('url');
					var loc = liburl.resolve(config.origin, locales[pathlang] + urls[i].loc);
					newurl.node('loc', loc);
					if( urls[i].priority )
						newurl.node('priority', urls[i].priority);
					if( urls[i].lastmod )
						newurl.node('lastmod', urls[i].lastmod);

					for(var hreflang=0; hreflang<locales.length; hreflang++)
					{
						newurl.node('xhtml:link').attr({
							'rel': 'alternate',
							'hreflang': hreflang===0 ? 'x-default' : locales[hreflang],
							'href': liburl.resolve(config.origin, locales[hreflang] + urls[i].loc)
						});
					}
				}
			}

			// return generated xml document
			res.set('Content-Type', 'text/xml');
			res.send(doc.toString());
			connection.end();
		}
	);
}

function serveRobots(req,res,next)
{
	if( !config.use_robots )
		return next();

	var disallowedUrlBases = [
		'/site/privacy',
		'/site/terms',
		'/newtoon',
		'/killtoon',
		'/register',
		'/post-register',
		'/federated-register',
		'/register/verify',
		'/togglePrivacy',
		'/passreset',
		'/pre-activate'
	];

	var disallowedUrls = [].concat(disallowedUrlBases);

	for(var i=0; i<res.i18n.config.locales.length; i++)
	{
		for(var j=0; j<disallowedUrlBases.length; j++)
		{
			disallowedUrls.push( '/'+res.i18n.config.locales[i]+disallowedUrlBases[j] );
		}
	}

	res.set('content-type', 'text/plain');
	res.send( 'User-agent: *\nDisallow: ' + disallowedUrls.join('\nDisallow: ') );
}

exports.serveSitemap = serveSitemap;
exports.serveRobots = serveRobots
