Translating the ToonStore
=========================

There are a couple of things you should be aware of if you want to translate the ToonStore.


Filenames
----------

Each translation file is in the *locales* directory, with a name like *en-US.json* or *pt-BR.json*. These filenames
are code for what language and country/region the translation is meant for. If you don't know your language and country
codes, you can look them up [here](http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes#Partial_ISO_639_table) and 
[here](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) respectively, or just contact me
and I'll look it up for you.

To start a new translation, copy and paste the contents of *en-US.json* into a new file by clicking the "+" icon next to the
directory name. Name the new file *{language}-{region}.json*, where *{language}* and *{region}* are your language and region codes, 
respectively. If your language is too specific to have a region, just leave it off, e.g. *{language}.json*. 


Translation File Contents
-------------------------

The translation files themselves are in what is called JSON format. Try not to be intimidated, it's quite simple. All you
really need to know is that the text is broken into *keys* and *values* separated by a colon (`:`). They might be grouped 
inside brackets (`{` and `}`), but you don't need to worry about that.

For each key/value pair, all you need to do is translate the English text (the value) into your native language. For example,
if the original `en-US.json` file looked like this:

	{
		"greeting": "Hello!"
	}

And I was making an Italian translation, then I would create the file `it-IT.json` and it would look like this:

	{
		"greeting": "Ciao!"
	}


Things To Look Out For
----------------------

The translation files are more or less sorted by priority, so if you're only going to be doing a partial translation, then start
at the top of the file and work your way down. The language won't go live until the translation is finished though, so try to find
someone to finish your partial translations if you're not going to finish it.

Some of the text will have special replacement markers (`%s` or `{{label}}`) in them. When the translation is used, that marker will be
replaced by some other text. For example, the header for the user page looks like "%s's page" in the translation file,
but will appear on the website as "Derogatory's page" or similar. When translating, make sure that you keep the replacement markers
in your text, so that it is correctly substituted for the site.

Sometimes single sentences will be broken into multiple key/value pairs. When you encounter this, make sure that spaces at the
beginning and end of the fragments are kept. Otherwise, when the sentence is put together, some words will get smashed together.
Consider the following translation fragment:

	"donate": {
		"f1": "Have you considered ",
		"f2": "donating",
		"f3": " to help keep the ToonStore online and ad-free?"
	}

Notice that *f1* has a space at the end, and *f3* has a space at the beginning. If those were removed, then the resulting sentence
would be "Have you considereddonatingto help keep the ToonStore online and ad-free?". Clearly that's not what we want, so make sure
the spaces are kept.


Contributing Your Translation
-----------------------------

If you're doing a translation, submit pull requests early and often. This gives me a chance to verify that everything still technically
works in your language, and allows other people to potentially help you with the work of translating. If you're not a developer, then
you can see what your translation looks like before it goes live (but after I accept your pull request) by going to the developer
preview version at http://toonstore.net:3000.


Questions? Comments?
--------------------

* Github: stevenvergenz
* E-mail: info@toonstore.net
* Google+ Group: https://plus.google.com/u/0/communities/100638011667854470760
* Reddit: OutOfMemory

