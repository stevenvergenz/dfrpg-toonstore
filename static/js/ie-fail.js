$(function(){
	if( !Modernizr.flexbox ){
		var html = '<aside class="content-block warning">'+
			globalClientStrings.f1 +
			'<a href="http://caniuse.com/flexbox">' + globalClientStrings.f2 + '</a>' +
			globalClientStrings.f3 +
			'</aside>';
		$('.content').prepend( $(html) );
	}
});
