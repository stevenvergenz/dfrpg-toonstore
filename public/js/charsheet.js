
function initialize()
{
	function processCharacterData(data,textStatus,jqXHR)
	{
		for( var i in data.stress ){
			var track = data.stress[i];
			track.boxes = ko.computed(function(){
				var boxes = [];
				for( var j=1; j<=8; j++ ){
					var icon = 'stressBox';
					if( track.toughness > 0 && j == track.strength+1 )
						icon += ' leftParen';
					if( track.toughness > 0 && j == track.strength+track.toughness )
						icon += ' rightParen';
					
					boxes.push({
						'index': j,
						'checked': track.used.indexOf(j) != -1,
						'disabled': j <= track.strength + track.toughness ? undefined : 'disabled',
						'icon': icon
					});
				}
				return boxes;
			});
			for( var j in track.armor ){
				var armor = track.armor[j];
				armor.boxes = ko.computed(function(){
					var boxes = [];
					for( var k=1; k<=armor.strength; k++ ){
						boxes.push({
							'index': k,
							'checked': armor.used.indexOf(k) != -1
						});
					}
					return boxes;
				});
			}
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

