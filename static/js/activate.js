
function checkPass()
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


	var strength = zxcvbn(pass.val());
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
}

function validate()
{
	var valid = checkPass();
	if( !valid ){
		$('#submitMessage').text('Fix the problems above before submitting');
	}
	else {
		$('#submitMessage').clear();
	}

	return valid;
}


