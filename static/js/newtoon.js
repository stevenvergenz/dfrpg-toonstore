function validate()
{
	var valid = /^[A-Za-z0-9_-]+$/.test( $('#canon_name').val() );
	if( !valid ){
		if( $('div.error').length == 0 )
			$('<div class="content-block"><div class="error"><p>'+clientStrings.invalid+'</p></div></div>').prependTo( $('.content') );
		else
			$('div.error>p').text(clientStrings.invalid);
	}
	return valid;
}

function generateSlug(fullName)
{
	var name = $(fullName).val();
	var slug = name.split(' ').pop().toLowerCase().replace(/[^\w]/g, '_');
	$('#canon_name').val(slug);
}

function prepopulateCopy()
{
	var match = /[?&]copy=([^&]+)/.exec(window.location.search);
	if(match){
		$.getJSON('/'+match[1]+'/json', function(data,status,xhr)
		{
			$('input#name').val(data.name);
			$('input#canon_name').val( match[1].split('/')[1] + '_dupe' );
			$('input#concept').val(data.aspects.high_concept.name);

			// select a template and hide the select if the template is provided as a query arg
			if( $('select#template > option[value="'+match[1]+'"]').length === 0 )
			{
				$('select#template').append(
					$('<option>', {value: match[1]} )
				);
			}
			$('select#template').val(match[1]);
			$('#templateContainer').css({display: 'none'});


			$('<aside class="info" style="margin-top: 15px;">'+
				clientStrings.duplicating+'<br/><strong>'+data.name+'</strong><br/><span class="caption">('+match[1]+')</span>'+
				'</div>'
			).insertBefore('.formbox form');
		});
	}
}

$(prepopulateCopy);
