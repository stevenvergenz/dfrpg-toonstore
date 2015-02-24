
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
	var time_display = moment.duration(strength.crack_time, 'seconds').locale(localeInfo.pathLocale).humanize();
	passMsg.text(time_display + (strength.score<3 ? " ("+clientStrings.toosimple+")" : ""));
	passMsg.css({color: colors[strength.score]});

	if( pass.val() === confirm.val() ){
		confirmMsg.text(clientStrings.match).css({color:'#555'});
	}
	else {
		confirmMsg.text(clientStrings.nomatch).css({color: 'red'});
	}

	return pass.val().length > 0
		&& pass.val() === confirm.val()
		&& strength.score >= 3;
}

function validate()
{
	var valid = checkPass();
	if( !valid ){
		$('#submitMessage').text(clientStrings.fix);
	}
	else {
		$('#submitMessage').clear();
	}

	return valid;
}


