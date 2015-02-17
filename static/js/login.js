
function prependMessageTo( obj, message )
{
	var messageBlock = $('<div class="content-block"><div id="page-message" class="'+message.type+'"><p>'+message.content+'</p></div></div>');
	$(obj).prepend( messageBlock );
}

var overrideUserRedirect = false;

$(document).ready(function()
{
	if( userInfo.persona_user )
	{
		handlePersona();
	}
});

function loginPersona()
{
	handlePersona();
	navigator.id.request();
}

function handlePersona()
{
	navigator.id.watch({
		'loggedInUser': userInfo.email,
		'onlogin': function(assertion){
			console.log('Attempting login');
			$.ajax({
				type: 'POST',
				url: '/login/persona',
				data: {'email': assertion},
				success: function(res,status,xhr){
					if( !overrideUserRedirect )
						window.location.href = (localeInfo.pathLocale ? '/'+localeInfo.pathLocale : '')+'/'+res.username;
					else
						window.location.reload();
				},
				error: function(xhr,status,err){
					console.log('Problem logging in');
					if( xhr.status == 403 ){
						prependMessageTo( $('.content'), {'type': 'error', 'content': 'Could not verify user credentials'} );
						setTimeout(function(){navigator.id.logout();},3000);
					}
					else if( xhr.status == 500 ){
						var response = JSON.parse(xhr.responseText);
						prependMessageTo( $('.content'), response.content );
						setTimeout(function(){navigator.id.logout();},3000);
					}
					else if( xhr.status == 307 ){
						var response = JSON.parse(xhr.responseText);
						window.location.replace(response.content);
					}
					else {
						prependMessageTo( $('.content'), {'type': 'error', 'content': 'Unidentified error logging in'} );
						setTimeout(function(){navigator.id.logout();},3000);
					}
				}
			});
		},

		'onlogout': function(){
			console.log('Attempting logout');
			$.ajax({
				type: 'POST',
				url: '/logout',
				success: function(res,status,xhr){
					if( !overrideUserRedirect )
						window.location.href = localeInfo.pathLocale ? '/'+localeInfo.pathLocale+'/' : '/';
					else
						window.location.reload();
				},
				error: function(xhr,status,err){
					console.log('Failed to request logout');
				}
			});
		}
	});
}

function logout()
{
	if( userInfo.persona_user ){
		navigator.id.logout();
	}
	else {
		console.log('Attempting logout');
		$.ajax({
			type: 'POST',
			url: '/logout',
			success: function(res,status,xhr){
				if( !overrideUserRedirect )
					window.location.href = localeInfo.pathLocale ? '/'+localeInfo.pathLocale+'/' : '/';
				else
					window.location.reload();
			},
			error: function(xhr,status,err){
				console.log('Failed to request logout');
			}
		});	
	}
}
