$(document).ready(function(){
	if( /msie/i.test(navigator.userAgent) ){
		$('.content').prepend( $('<div class="content-block"><div class="error"><p>This page is not supported by Internet Explorer.</p></div></div>') );
	}
});
