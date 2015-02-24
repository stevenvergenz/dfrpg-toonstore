"use strict";

var i18n = require('i18n'),
	libpath = require('path'),
	express = require('express');

var global = require('./global.js');

// the translation middleware
var config = {
	locales: ['en-US','pt-BR','cs-CZ'],
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
	res.redirect = function(url)
	{
		if( this.i18n.pathLocale ){
			return express.response.redirect.call(this, '/'+this.i18n.pathLocale+url);
		}
		else {
			return express.response.redirect.call(this, url);
		}
	}.bind(res);

	var pathLang = detectPathLocale(req.url, req);
	var cookieLang = detectCookieLocale(req.cookies[config.cookie]);
	var headerLang = detectHeaderLocale(req.headers['accept-language']);

	res.i18n.cookieLocale = cookieLang;
	res.i18n.pathLocale = pathLang;
	res.i18n.headerLocale = headerLang;

	//console.log([pathLang, cookieLang, headerLang]);

	if( pathLang && cookieLang ){
		// render in path lang, prompt to switch in cookie lang
		res.i18n.selectedLocale = pathLang;
		res.i18n.nativeLocale = cookieLang;
	}
	else if( pathLang && headerLang && pathLang !== headerLang ){
		// render in path lang, prompt to switch in header lang
		res.i18n.selectedLocale = pathLang;
		res.i18n.nativeLocale = headerLang;
	}
	else if( pathLang ){
		// render in path lang
		res.i18n.selectedLocale = pathLang;
	}
	else if( cookieLang ){
		// render in default lang, prompt to switch in cookie lang
		res.i18n.selectedLocale = config.defaultLocale;
		res.i18n.nativeLocale = cookieLang;
	}
	else if( headerLang && headerLang !== config.defaultLocale ){
		// render in default lang, prompt to switch in header lang
		res.i18n.selectedLocale = config.defaultLocale;
		res.i18n.nativeLocale = headerLang;
	}
	else {
		// render in default lang
		res.i18n.selectedLocale = config.defaultLocale;
	}

	res.setHeader("Content-Language", res.i18n.selectedLocale);

	next();
};

function detectPathLocale(path, req)
{
	// extract locale selector from path
	var match = /^\/([A-Za-z-]+)\//.exec(path);
	var part = match ? match[1].toUpperCase() : null;

	for(var i=0; i<config.locales.length; i++)
	{
		if( config.locales[i].toUpperCase() === part ){
			req.url = req.url.slice( part.length+1 );
			return config.locales[i];
		}
		else if( /(\w{2})-/.exec(config.locales[i])[1].toUpperCase() === part ){
			req.url = req.url.slice( part.length+1 );
			return config.locales[i];
		}
	}

	return null;
}

function detectCookieLocale(cookie)
{
	cookie = cookie ? cookie.toUpperCase() : null;

	for(var i=0; i<config.locales.length; i++)
	{
		if( config.locales[i].toUpperCase() === cookie ){
			return config.locales[i];
		}
		else if( /(\w{2})-/.exec(config.locales[i])[1].toUpperCase() === cookie ){
			return config.locales[i];
		}
	}

	return null;
}

function detectHeaderLocale(header)
{
	var langs = header.split(',').map(function(l){
		var match = /([A-Za-z-]+)(?:;q=([0-9.]+))?/.exec(l);
		return {
			'locale': match[1].toUpperCase(),
			'preference': match[2] ? parseFloat(match[2]) : 1
		};
	});
	langs.sort(function(a,b){ return b.preference - a.preference; });

	for(var acceptIdx=0; acceptIdx<langs.length; acceptIdx++)
	{
		for(var langIdx=0; langIdx<config.locales.length; langIdx++)
		{
			if( langs[acceptIdx].locale === config.locales[langIdx].toUpperCase() )
				return config.locales[langIdx];
		}
	}

	return null;
}

exports.cookieRedirect = function(req,res,next)
{
	if( res.i18n.cookieLocale && !res.i18n.pathLocale ){
		global.log('Cookie redirect to preferred locale');
		res.redirect( '/'+res.i18n.cookieLocale+ req.url );
	}
	else {
		next();
	}
};


/*
 * Forced language code
 */

function MyI18n()
{
	this.selectedLocale = null;
	this.nativeLocale = null;
}

MyI18n.prototype.config = config;

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
