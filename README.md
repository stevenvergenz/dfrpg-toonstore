# dfrpg-toonstore

View/edit/share Dresden Files character sheets online

## Dependencies

* Node.js v0.10 or greater
* Various npm packages (just run 'npm install')


## Installation

	$ git clone https://github.com/stevenvergenz/dfrpg-toonstore.git
	$ npm install


## Configuration

### Regenerate self-signed SSL certificate

	$ openssl req -x509 -nodes -newkey rsa:2048 -keyout keys/agent2-key.pem -out keys/agent2-cert.pem

### Configure database

1. Create a MySQL user and database for ToonStore
2. Add the MySQL credentials to global.js.
3. Import the sample database dump 'toonstore.sql'

### Configure server

Set the port in global.js.


## Running

    $ node app.js
	$ firefox https://localhost:3001/
	
There is a test user in the database template. The logins are:

	User: tester
	Email: tester@example.com
	Pass: tester

NOTE: Server only runs in HTTPS mode for now, so don't forget to put that into your browser when testing it.
