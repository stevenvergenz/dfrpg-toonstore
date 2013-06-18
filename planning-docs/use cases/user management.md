## Use case 1: user management


### Home page

* A logo/splash screen of some sort
* Information about the project
* Fields for login information
* A link to create a new user
* A link to reset a forgotten password


### User creation page

* username
* email address
* real name (optional)
* password
* password-confirm
* [Create user] button

Once the information is entered, the site generates and saves a uuid, and sends a confirmation email to the user for 
activation. The email contains a link of the format [http://example.com/activate/f47ac10b-58cc-4372-a567-0e02b2c3d479].
When clicked, the link will enable login for that user. Link expires after 24 hours.


### Reset password page

Prompts for email address, generates and saves a uuid, and sends a reset email to the user with a link of the form
[http://example.com/reset/f47ac10b-58cc-4372-a567-0e02b2c3d479]. When clicked, the link will load a page that prompts
the user for a new password, and resets. The link will expire after 24 hours. Once the password is reset, post message
saying the password was successfully reset, and provide a link to go back to the login page.


### User profile page

* URL of the format [http://example.com/username]
* Edit user profile (name, email, reset password)
* List of created characters
* A button to create a new character