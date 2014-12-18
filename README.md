# dfrpg-toonstore

View/edit/share Dresden Files character sheets online. Use the hosted version at [toonstore.net](https://toonstore.net), or set up your own instance!

## Dependencies

* Node.js v0.10 or greater
* Various npm packages (just run 'npm install')


## Installation

	$ git clone https://github.com/stevenvergenz/dfrpg-toonstore.git
	$ npm install


## Configuration

### Create config file

1. Copy *config.sample.json* to *config.json*.
2. Open *config.json* in your favorite text editor.
3. Set the server's listen port, cookie secret, and origin URL.

### Configure database

1. Create a MySQL database and privileged user for ToonStore.

 		mariadb> CREATE USER 'tsuser'@'localhost' IDENTIFIED BY 'password';
		mariadb> CREATE DATABASE 'toonstore';
		mariadb> GRANT ALL ON toonstore.* TO 'tsuser'@'localhost';

2. Add the MySQL login information to *config.json*.

3. Import the sample database dump *toonstore.sql*.

		user@localhost:~$ mysql -u tsuser -p toonstore < toonstore.sql
		Enter password: *********


## Running

    $ node src/app.js
	$ chrome http://localhost:3001/
	

