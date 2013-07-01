
function initialize()
{
	function processCharacterData(data,textStatus,jqXHR)
	{
		ko.applyBindings(data);
	}

	// retrieve the character sheet data
	$.getJSON( window.location.pathname + '/json', processCharacterData );
}

function stressUpdated()
{
	
	console.log('Stress updated');
}

