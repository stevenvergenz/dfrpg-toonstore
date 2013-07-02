var model;
var viewModel;

function SheetViewModel(data)
{
	// initialize general data
	this.name = ko.observable(data.name);
	this.player = ko.observable(data.player);

	// initialize aspect data
	this.aspects = {
		'high_concept': {
			'name': ko.observable(data.aspects.high_concept.name),
			'description': ko.observable(data.aspects.high_concept.description)
		},
		'trouble': {
			'name': ko.observable(data.aspects.trouble.name),
			'description': ko.observable(data.aspects.trouble.description)
		},
		'aspects': ko.observableArray()
	};
	for( var i in data.aspects.aspects ){
		var aspect = data.aspects.aspects[i];
		this.aspects.aspects.push({
			'name': ko.observable(aspect.name),
			'description': ko.observable(aspect.description)
		});
	}

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

	// initialize consequence data
	this.consequences = ko.observableArray();
	for( var i in data.consequences ){
		var oldConseq = data.consequences[i];
		var conseq = {
			'severity': ko.observable(oldConseq.severity),
			'mode': ko.observable(oldConseq.mode),
			'used': ko.observable(oldConseq.used),
			'aspect': ko.observable(oldConseq.aspect)
		};
		conseq.magnitude = ko.computed(function(){
			var map = {'Mild': -2, 'Moderate': -4, 'Severe': -6, 'Extreme': -8};
			return map[this.severity()];
		}, conseq);
		
		this.consequences.push(conseq);
	}

	// initialize totals data
	this.totals = {
		'power_level': ko.observable(data.totals.power_level),
		'base_refresh': ko.observable(data.totals.base_refresh),
		'skill_cap': ko.observable(data.totals.skill_cap),
		'skills_total': ko.observable(data.totals.skills_total),
		'skills_available': ko.observable(data.totals.skills_available),
		'adjusted_refresh': ko.observable(data.totals.adjusted_refresh),
		'fate_points': ko.observable(data.totals.fate_points)
	};
	this.totals.skill_text = function(val){
		var ladder = ['Mediocre (+0)', 'Average (+1)', 'Fair (+2)', 'Good (+3)', 'Great (+4)', 'Superb (+5)', 'Fantastic (+6)', 'Epic (+7)', 'Legendary (+8)'];
		return ladder[val];
	};
	this.totals.skill_cap_text = ko.computed(function(){
		return this.skill_text(this.skill_cap());
	}, this.totals);
	this.totals.skills_spent = ko.computed(function(){
		return this.skills_total() - this.skills_available();
	}, this.totals);
}

function processCharacterData(data,textStatus,jqXHR)
{
	/*
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


