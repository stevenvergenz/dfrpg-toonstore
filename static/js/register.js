
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
	var valid = userGood;

	if( !valid ){
		$('#submitMessage').text('Fix the problems above before submitting');
	}
	else {
		$('#submitMessage').clear();
	}

	return valid;
}

