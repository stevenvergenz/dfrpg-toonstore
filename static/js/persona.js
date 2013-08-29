
function prependMessageTo( obj, message )
{
	var messageBlock = $('<div class="content-block"><div id="page-message" class="'+message.type+'"><p>'+message.content+'</p></div></div>');
	$(obj).prepend( messageBlock );
}

var overrideUserRedirect = false;

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
					if( !overrideUserRedirect )
						window.location.replace('/'+res.username);
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
						window.location.replace('/');
					else
						window.location.reload();
				},
				error: function(xhr,status,err){
					console.log('Failed to request logout');
				}
			});
		}
	});
});

