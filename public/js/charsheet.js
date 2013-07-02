
function initialize()
{
	function processCharacterData(data,textStatus,jqXHR)
	{
		// add an itemized format for stress boxes
		for( var i in data.stress )
		{
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

			// add an itemized format for armor boxes
			for( var j in track.armor )
			{
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

		// calculate consequence strength
		for( var i in data.consequences ){
			var conseq = data.consequences[i];
			conseq.strength = ko.computed(function(){
				if( this.type == 'Mild' )
					return -2;
				else if( this.type == 'Moderate' )
					return -4;
				else if( this.type == 'Severe' )
					return -6;
				else if( this.type == 'Extreme' )
					return -8;
				else
					return 0;
			}, conseq);
		}

		data.totals.skill_cap_text = ko.computed(function(){
			var ladder = ['Mediocre (+0)', 'Average (+1)', 'Fair (+2)', 'Good (+3)', 'Great (+4)', 'Superb (+5)', 'Fantastic (+6)', 'Epic (+7)', 'Legendary (+8)'];
			return ladder[this.skill_cap];
		}, data.totals);

		data.totals.skills_spent = ko.computed(function(){
			return this.skills_total - this.skills_available;
		}, data.totals);

		// apply modified json document to page
		ko.applyBindings(data);
	}

	// retrieve the character sheet data
	$.getJSON( window.location.pathname + '/json', processCharacterData );
}

function stressUpdated()
{
	
	console.log('Stress updated');
}

