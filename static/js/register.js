
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

function validateUsername()
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

function validate()
{
	//var valid = userGood && checkPass();
	var valid = userGood;
	if( !valid ){
		$('#submitMessage').text('Fix the problems above before submitting');
	}
	else {
		$('#submitMessage').clear();
	}

	return valid;
}

/*function checkPass()
{
	var pass = $('input#password');
	var confirm = $('input#confirm');
	var passMsg = $('p#passStrength span');
	var confirmMsg = $('p#passMatch');
	var colors = {
		0: 'red',
		1: 'orangered',
		2: 'orange',
		3: 'green',
		4: 'blue'
	};


	var strength = zxcvbn(pass.val(), [$('#username').val()]);
	passMsg.text(strength.crack_time_display + (strength.score<3 ? " (too simple!)" : ""));
	passMsg.css({color: colors[strength.score]});

	if( pass.val() === confirm.val() ){
		confirmMsg.text('Passwords match').css({color:'#555'});
	}
	else {
		confirmMsg.text('Passwords do not match').css({color: 'red'});
	}

	return pass.val().length > 0
		&& pass.val() === confirm.val()
		&& strength.score >= 3;
}*/
