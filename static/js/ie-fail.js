$(document).ready(function(){
	if( /msie/i.test(navigator.userAgent) ){
		$('.content').prepend( $('<div class="content-block"><div class="warning"><p>This page is not fully supported by IE. If you experience problems, try switching to Chrome.</p></div></div>') );
	}
});
