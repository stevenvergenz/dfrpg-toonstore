Translating the ToonStore
=========================

There are a couple of things you should be aware of if you want to translate the ToonStore.


Filenames
----------

Each translation file is in the *locales* directory, with a name like *en-US.json* and *pt-BR.json*. These filenames
are code for what language and country/region the translation is meant for. If you don't know your language and country
codes, you can look them up [here](http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes#Partial_ISO_639_table) and 
[here](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) respectively, or just contact me
and I'll look it up for you.

To start a new translation, copy and paste the contents of *en-US.json* into a new file by clicking the "+" icon next to the
directory name, and name it *{language}-{region}.json*, where *{language}* and *{region}* are your language and region codes, 
respectively. If your language is too specific to have a region, just leave it off (*{language}.json*). 


Translation File Contents
-------------------------

The translation files themselves are in what is called JSON format. Try not to be intimidated, it's quite simple. All you
really need to know is that the text is broken into *keys* and *values* separated by a colon (`:`). They might be inside
brackets (`{` and `}`), but you don't need to worry about that.

For each key/value pair, all you need to do is translate the English text (the value) into your native language. For example,
if the original `en-US.json` file looked like this:

	{
		"greeting": "Hello!"
	}

And I was making an Italian translation, then I would create the file `it-IT.json` and it would look like this:

	{
		"greeting": "Ciao!"
	}

TODO:

* Discuss the importance of whitespace and %s's
* Commit conventions
