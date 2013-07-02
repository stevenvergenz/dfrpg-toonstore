var model;
var viewModel;

function SheetViewModel(data)
{
	// initialize general data
	this.name = ko.observable(data.name);
	this.player = ko.observable(data.player);

	// construct stress data
	this.stress = ko.observableArray();
	for( var i in data.stress )
	{
		// construct a single stress track
		var track = data.stress[i];
		var viewTrack = {
			'name': ko.observable(track.name),
			'skill': ko.observable(track.skill),
			'toughness': ko.observable(track.toughness),
			'boxes': ko.observableArray(),
			'armor': ko.observableArray()
		};

		// construct stress boxes
		for( var j=0; j<track.boxes.length; j++ ){
			var box = {
				'used': ko.observable(track.boxes[j].used),
				'icon': ko.computed(function(){
					var icon = 'stressBox';
					if( track.toughness != 0 && j == track.boxes.length-track.toughness )
						icon += ' leftParen';
					if( track.toughness != 0 && j == track.boxes.length-1 )
						icon += ' rightParen';
					return icon;
				}, viewTrack)
			}
			viewTrack.boxes.push(box);
		}

		// construct armor boxes
		for( var j=0; j<track.armor.length; j++ ){
			var armor = {
				'vs': track.armor[j].vs,
				'boxes': ko.observableArray()
			};
			for( var k=0; k<track.armor[j].boxes.length; k++ ){
				armor.boxes.push({
					'used': ko.observable(track.armor[j].boxes[k].used)
				});
			}
			viewTrack.armor.push(armor);
		}

		this.stress.push(viewTrack);
	}
}

function processCharacterData(data,textStatus,jqXHR)
{
	// add an itemized format for stress boxes
	/*for( var i in data.stress )
	{
		var track = data.stress[i];
		track.boxes = ko.computed(function(){
			var boxes = ko.observableArray();
			for( var j=1; j<=8; j++ ){
				var icon = 'stressBox';
				if( track.toughness > 0 && j == track.strength+1 )
					icon += ' leftParen';
				if( track.toughness > 0 && j == track.strength+track.toughness )
					icon += ' rightParen';
				
				var box = {
					'index': j,
					'checked': ko.computed({
						'read': function(){
							
							return track.used.indexOf(j) != -1;
						},
						'write': function(value){
							if( track.used.indexOf(j) == -1 && value == true ){
								track.used.push(j);
							}
							else if( track.used.indexOf(j) != -1 && value == false ){
								var i = track.used.indexOf(j);
								track.used.splice(i,1);
							}
							console.log(this);
						},
						'owner': box
					}),
					'disabled': j <= track.strength + track.toughness ? undefined : 'disabled',
					'icon': icon
				};
				boxes.push( box );
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

	data.totals.skill_text = function(val){
		var ladder = ['Mediocre (+0)', 'Average (+1)', 'Fair (+2)', 'Good (+3)', 'Great (+4)', 'Superb (+5)', 'Fantastic (+6)', 'Epic (+7)', 'Legendary (+8)'];
		return ladder[val];
	};
	data.totals.skill_cap_text = ko.computed(function(){
		return data.totals.skill_text( this.skill_cap );
	}, data.totals);

	data.totals.skills_spent = ko.computed(function(){
		return this.skills_total - this.skills_available;
	}, data.totals);

	data.skills.skill_sets = ko.computed(function(){
		var sets = [];
		for( var i=data.totals.skill_cap; i>0; i-- ){
			sets.push({
				'level_text': data.totals.skill_text(i),
				'skills': data.skills[i]
			});
		}
		return sets;
	});

	for( var i in data.powers ){
		var power = data.powers[i];
		power.clean_description = ko.computed(function(){
			return this.description.split('\n');
		}, power);
	}
	data.powers.total = ko.computed(function(){
		var sum = 0;
		for( var i in data.powers ){
			sum += data.powers[i].cost;
		}
		return sum;
	});*/

	// apply modified json document to page
	model = data;
	viewModel = new SheetViewModel(data);
	ko.applyBindings(viewModel);
}

function initialize(){
	// retrieve the character sheet data
	$.getJSON( window.location.pathname + '/json', processCharacterData );
}


