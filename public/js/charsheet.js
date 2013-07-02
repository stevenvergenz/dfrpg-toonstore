
function initialize()
{
	function processCharacterData(data,textStatus,jqXHR)
	{
		for( var i in data.stress ){
			data.stress[i].boxes = ko.computed(function(){
				var boxes = [];
				for( var j=1; j<=8; j++ ){
					var box = data.stress[i];
					boxes.push({
						'checked': box.used.indexOf(j) != -1,
						'enabled': j <= box.strength + box.toughness,
						'left-paren': box.toughness > 0 && j == box.strength+1 ? 'left-paren' : 'normal',
						'right-paren': box.toughness > 0 && j == box.strength+box.toughness ? 'right-paren' : 'normal'
					});
				}
				return boxes;
			});
		}
		ko.applyBindings(data);
	}

	// retrieve the character sheet data
	$.getJSON( window.location.pathname + '/json', processCharacterData );
}

function stressUpdated()
{
	
	console.log('Stress updated');
}

