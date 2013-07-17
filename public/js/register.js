// validate the contents of the form before submitting it
var passLength = 3;
var passGood = false;
function checkPassword()
{
	// validate password
	var passTest = new RegExp('^.{'+passLength+',}$');
	var passwordValid = passTest.test($('#password').val());
	if( !passwordValid ){
		$('#passwordMessage').addClass('error');
		$('#password').addClass('error');
	}
	else {
		$('#passwordMessage').removeClass('error');
		$('#password').removeClass('error');
	}

	// confirm password
	var confirmValid = $('#confirm').val() == $('#password').val();
	if( !confirmValid ){
		$('#confirmMessage').addClass('error').text('Passwords do not match!');
		$('#confirm').addClass('error');
	}
	else {
		$('#confirmMessage').removeClass('error').text('Passwords match.');
		$('#confirm').removeClass('error');
	}

	passGood = passwordValid && confirmValid;
}

var userGood = false;
var checkNameTimeout = null;
function checkUsername(elem)
{
	// check the username against the active user list
	var callback = function(){
		$.get('/register/verify?a='+encodeURIComponent(elem.value), function(data)
		{
			if( data.found ){
				userGood = false;
				$('#username').addClass('error');
				$('#userMessage').addClass('error').text('Username is already taken.');
			}
			else {
				userGood = true;
				$('#username').removeClass('error');
				$('#userMessage').removeClass('error').text('Username is available.');
			}
		});
	};

	var userValid = /^[A-Za-z0-9_-]+$/.test($(elem).val());
	if( checkNameTimeout )
		clearTimeout(checkNameTimeout);

	if( !userValid ){
		userGood = false;
		$('#username').addClass('error');
		$('#userMessage').addClass('error').text('Username is invalid!');
	}
	// wait a second before checking the username
	else {
		checkNameTimeout = setTimeout(callback, 700);
	}
}

function validate()
{
	var valid = userGood && passGood;

	if( !valid ){
		$('#submitMessage').text('Fix the problems above before submitting');
	}
	else {
		$('#submitMessage').clear();
	}

	return valid;
}

