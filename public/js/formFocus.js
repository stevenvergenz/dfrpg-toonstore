function registerInputs()
{
	$('form input.vacant').focus( function(){ inputFocus(this); } );
	$('form input.vacant').blur( function(){ inputBlur(this); } );
}

function inputFocus(i){
	if( i.value == i.defaultValue ){
		i.value = "";
		$(i).removeClass('vacant');
	}
}

function inputBlur(i){
	if( i.value == "" ){
		i.value = i.defaultValue;
		$(i).addClass('vacant');
	}
}

