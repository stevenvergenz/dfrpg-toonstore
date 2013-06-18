## Data storage ideas

SQL database

table Users:
	username char(30),
	salted_hashed_password int(32)
	
table Characters:
	toon_id char(30),
	owner char(30),
	data char(2000)
	

## Security ideas

Hash algorithm:

use iterated-hash of username as salt inserted every n characters?

e.g. for user and password:

	n = user.length%5;
	salt = hash(user);
	runningHash = '';
	for(chunk=0; chunk<user.length; chunk += n){
		runningHash += salt + password.slice(chunk,chunk+n);
		salt = hash(salt);
	}
	return hash(runningHash+salt);