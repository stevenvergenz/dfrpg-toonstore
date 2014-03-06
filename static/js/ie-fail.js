$(document).ready(function(){
	if( !Modernizr.flexbox ){
		$('.content').prepend( $('<div class="content-block"><div class="warning"><p>This site is <a href="http://caniuse.com/flexbox" style="color:blue;">not fully supported</a> by your browser. If you experience problems, try upgrading to the latest version of your browser, or switching to Chrome.</p></div></div>') );
	}
});
