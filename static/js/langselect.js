
var menu, ul, icon;

$(function()
{
	menu = $('.footer .langselectmenu');
	ul = $('.langselect', menu);
	trigger = $('.langselecticon', menu);

	//var offset = trigger.offset();
	//ul.offset({bottom: offset.bottom, left: offset.left});
	$('.langselect .active').click(langSelect);
	trigger.click(langSelect);
});


function langSelect()
{
	if( menu.hasClass('active') )
		menu.removeClass('active');
	else
		menu.addClass('active');
}


