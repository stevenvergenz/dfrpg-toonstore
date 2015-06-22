
var userGood = true;
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
				$('#userMessage').addClass('error').text(clientStrings.userTaken);
			}
			else {
				userGood = true;
				$('#username').removeClass('error');
				$('#userMessage').removeClass('error').text(clientStrings.userAvailable);
			}
		});
	};

	var userValid = /^[A-Za-z0-9_-]+$/.test($(elem).val());
	if( checkNameTimeout )
		clearTimeout(checkNameTimeout);

	if( !userValid ){
		userGood = false;
		$('#username').addClass('error');
		$('#userMessage').addClass('error').text(clientStrings.userInvalid);
	}
	// wait a second before checking the username
	else {
		checkNameTimeout = setTimeout(callback, 700);
	}
}

function validateUsername()
{
	var valid = userGood;

	if( !valid ){
		$('#submitMessage').text(clientStrings.fix);
	}
	else {
		$('#submitMessage').clear();
	}

	return valid;
}

function validate()
{
	//var valid = userGood && checkPass();
	var valid = userGood;
	if( !valid ){
		$('#submitMessage').text(clientStrings.fix);
	}
	else {
		$('#submitMessage').clear();
	}

	return valid;
}


