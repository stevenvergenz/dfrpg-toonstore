# dfrpg-toonstore

View/edit/share Dresden Files character sheets online

## Dependencies

Node.js v0.10 or greater
Various npm packages


## Installation

	$ git clone https://github.com/stevenvergenz/dfrpg-toonstore.git
	$ npm install


## Configuration

### Regenerate self-signed SSL certificate

	$ openssl req -x509 -nodes -newkey rsa:2048 -keyout keys/agent2-key.pem -out keys/agent2-cert.pem

### Configure database

1. Create a MySQL user and database for ToonStore, and add the credentials to global.js.
2. Import the sample database dump 'toonstore.sql'

### Configure server

Set the port in global.js.


## Running

    $ node app.js

