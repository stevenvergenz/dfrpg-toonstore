
function prependMessageTo( obj, message )
{
	var messageBlock = $('<div class="content-block"><div id="page-message" class="'+message.type+'"><p>'+message.content+'</p></div></div>');
	$(obj).prepend( messageBlock );
}


$(document).ready(function()
{
	navigator.id.watch({
		'loggedInUser': userInfo.email,
		'onlogin': function(assertion){
			console.log('Attempting login');
			$.ajax({
				type: 'POST',
				url: '/login',
				data: {'email': assertion},
				success: function(res,status,xhr){
					window.location.replace('/'+res.username);
				},
				error: function(xhr,status,err){
					console.log('Problem logging in');
					if( xhr.status == 403 ){
						prependMessageTo( $('.content'), {'type': 'error', 'content': 'Could not verify user credentials'} );
						navigator.id.logout();
					}
					else if( xhr.status == 500 ){
						var response = JSON.parse(xhr.responseText);
						prependMessageTo( $('.content'), response.content );
						navigator.id.logout();
					}
					else if( xhr.status == 307 ){
						var response = JSON.parse(xhr.responseText);
						window.location.replace(response.content);
					}
					else {
						prependMessageTo( $('.content'), {'type': 'error', 'content': 'Unidentified error logging in'} );
						navigator.id.logout();
					}
				}
			});
		},

		'onlogout': function(){
			console.log('Attempting logout');
			$.ajax({
				type: 'POST',
				url: '/logout',
				success: function(res,status,xhr){ window.location.replace('/'); },
				error: function(xhr,status,err){
					console.log('Failed to request logout');
				}
			});
		}
	});
});

