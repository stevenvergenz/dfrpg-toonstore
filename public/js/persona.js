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
				success: function(res,status,xhr){ window.location.reload(); },
				error: function(xhr,status,err){
					navigator.id.logout();
					console.log('Failed to request login');
				}
			});
		},
		'onlogout': function(){
			console.log('Attempting logout');
			$.ajax({
				type: 'POST',
				url: '/logout',
				success: function(res,status,xhr){ window.location.reload(); },
				error: function(xhr,status,err){
					console.log('Failed to request logout');
				}
			});
		}
	});
});

