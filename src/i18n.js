"use strict";

var i18n = require('i18n');

// the translation middleware
var config = {
	locales: ['en-US','pt-BR'],
	defaultLocale: 'en-US',
	directory: libpath.resolve(__dirname,'..','locales'),
	extension: '.json',
	updateFiles: false,
	objectNotation: true,
	cookie: 'preferredLang'
};

i18n.configure(config);

exports.detect = function(req,res,next)
{
	res.i18n = new MyI18n();

	var pathLang = detectPathLocale(req.url);
	var cookieLang = detectCookieLocale(req.cookies[config.cookie]);
	var headerLang = detectHeaderLocale(req.headers['accept-language']);

	if( pathLang && cookieLang ){
		// render in path lang, prompt to switch in cookie lang
	}
	else if( pathLang && headerLang ){
		// render in path lang, prompt to switch in header lang
	}
	else if( pathLang ){
		// render in path lang
	}
	else if( cookieLang ){
		// redirect to cookie lang
	}
	else if( headerLang ){
		// redirect to header lang
	}
	else {
		// render in default lang
		res.i18n.selectedLocale = config.defaultLocale;
		next();
	}
};

function detectPathLocale(path)
{
	return null;
}

function detectCookieLocale(cookie)
{
	return null;
}

function detectHeaderLocale(header)
{
	return null;
}


/*
 * Forced language code
 */

function MyI18n()
{
	this.selectedLocale = null;
	this.nativeLocale = null;
}

MyI18n.prototype.__ = function()
{
	var args = Array.prototype.slice.call(arguments);
	args[0] = {'locale': this.selectedLocale, 'phrase': args[0]};
	return i18n.__.apply(i18n, args);
};

MyI18n.prototype.__n = function(opt)
{
	opt.locale = this.selectedLocale;
	return i18n.__n(opt);
};

MyI18n.prototype.n__ = function()
{
	if( !this.nativeLocale ){
		return this.__.apply(this, arguments);
	}
	else {
		var args = Array.prototype.slice.call(arguments);
		args[0] = {'locale': this.nativeLocale, 'phrase': args[0]};
		return i18n.__.apply(i18n, args);
	}
};

MyI18n.prototype.n__n = function(opt)
{
	if( !this.nativeLocale ){
		return this.__n(opt);
	}
	else {
		opt.locale = this.nativeLocale;
		return i18n.__n(opt);
	}
};
