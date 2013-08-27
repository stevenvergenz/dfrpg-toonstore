# dfrpg-toonstore

View/edit/share Dresden Files character sheets online

## Dependencies

* Node.js v0.10 or greater
* Various npm packages (just run 'npm install')


## Installation

	$ git clone https://github.com/stevenvergenz/dfrpg-toonstore.git
	$ npm install


## Configuration

### Configure database

1. Create a MySQL user and database for ToonStore
2. Add the MySQL credentials to global.js.
3. Import the sample database dump 'toonstore.sql'

### Configure server

1. Open global.js in your text editor of choice.
2. Set the server's listen port where indicated.
3. Set the server's cookie secret where indicated.
4. Set the public-facing URL for login verification.


## Running

    $ node app.js
	$ chrome http://localhost:3001/
	
There is a test user in the database template. Though you can no longer log into the account, you can view the sample character sheet
by viewing https://example.com/tester/lifeson.

