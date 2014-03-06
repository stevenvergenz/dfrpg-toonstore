$(document).ready(function(){
	if( !Modernizr.flexbox ){
		$('.content').prepend( $('<div class="content-block"><div class="warning"><p>This page is not fully supported by your browser. If you experience problems, try upgrading to the latest version or switching to Chrome.</p></div></div>') );
	}
});
