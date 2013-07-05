function StressBox(index, used, track)
{
	this.index = index;
	this.used = ko.observable(used);
	this.icon = ko.computed(function(){
		var icon = 'stressBox';
		if( track.toughness() != 0 && this.index == track.boxes().length-track.toughness() )
			icon += ' leftParen';
		if( track.toughness() != 0 && this.index == track.boxes().length-1 )
			icon += ' rightParen';
		return icon;
	}, this, {deferEvaluation: true});
	
}

function StressArmor(armor){
	this.vs = ko.observable(armor.vs);
	this.strength = ko.observable(armor.strength);
	this.text = ko.computed(function(){
		return 'Armor: '+this.strength()+' vs. '+this.vs();
	}, this);
}

function StressTrack(track)
{
	// construct a single stress track
	this.name = ko.observable(track.name);
	this.skill = ko.observable(track.skill);
	this.toughness = ko.observable(track.toughness);
	this.boxes = ko.observableArray();
	this.armor = ko.observableArray();

	this.strength = ko.computed({
		'read': function(){
			return this.boxes().length;
		},
		'write': function(str){
			var diff = str - this.boxes().length;
			if( diff > 0 ){
				for( var i=0; i<diff; i++ ){
					this.boxes.push( new StressBox( this.boxes().length, false, this) );
				}
			}
			else if( diff < 0 ){
				for( var i=diff; i<0; i++ ){
					this.boxes.pop();
				}
			}
		}}, this
	);

	// construct stress boxes
	for( var j=0; j<track.boxes.length; j++ ){
		this.boxes.push( new StressBox(j, track.boxes[j].used, this) );
	}

	// construct armor boxes
	for( var j=0; j<track.armor.length; j++ ){
		this.armor.push( new StressArmor(track.armor[j]) );
	}
}

function Consequence(oldConseq){
	this.severity = ko.observable(oldConseq.severity);
	this.mode = ko.observable(oldConseq.mode);
	this.used = ko.observable(oldConseq.used);
	this.aspect = ko.observable(oldConseq.aspect);
	this.magnitude = ko.computed(function(){
		var map = {'Mild': -2, 'Moderate': -4, 'Severe': -6, 'Extreme': -8};
		return map[this.severity()];
	}, this);
}

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
	for( var i in data.stress ){
		this.stress.push( new StressTrack(data.stress[i]) );
	}

	this.stress_types = ko.computed(function(){
		var types = ['Any'];
		for( var i in this.stress() ){
			if( types.indexOf(this.stress()[i].name()) == -1 ){
				types.push( this.stress()[i].name() );
			}
		}
		return types;
	}, this);

	// initialize consequence data
	this.consequences = ko.observableArray();
	for( var i in data.consequences ){
		this.consequences.push( new Consequence(data.consequences[i]) );
	}
	this.sorted_consequences = ko.computed(function(){
		return this.consequences().sort(function(left,right){
			var severity = ['Mild', 'Moderate', 'Severe', 'Extreme'];
			if( severity.indexOf(left.severity()) < severity.indexOf(right.severity()) ){
				return -1;
			}
			else if( severity.indexOf(left.severity()) > severity.indexOf(right.severity()) ){
				return 1;
			}
			else {
				if( left.mode() < right.mode() ){
					return -1;
				}
				else if( left.mode() > right.mode() ){
					return 1;
				}
				else {
					return 0;
				}
			}
		});
	}, this);

	// initialize skills data
	this.skills = {
		"6": ko.observableArray(data.skills[6]),
		"5": ko.observableArray(data.skills[5]),
		"4": ko.observableArray(data.skills[4]),
		"3": ko.observableArray(data.skills[3]),
		"2": ko.observableArray(data.skills[2]),
		"1": ko.observableArray(data.skills[1])
	};

	// initialize powers data
	this.powers = ko.observableArray();
	for( var i in data.powers ){
		var oldPower = data.powers[i];
		var power = {
			'cost': ko.observable(oldPower.cost),
			'name': ko.observable(oldPower.name),
			'description': ko.observable(oldPower.description)
		};
		power.clean_description = ko.computed(function(){
			return this.description().split('<br>');
		}, power);
		this.powers.push(power);
	}
	this.powers.total = ko.computed(function(){
		var sum = 0;
		for( var i in this.powers() ){
			sum += this.powers()[i].cost();
		}
		return sum;
	}, this);

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


	this.skills.skill_sets = ko.computed(function(){
		var sets = [];
		for( var i=this.totals.skill_cap(); i>0; i-- ){
			sets.push({
				'level_text': this.totals.skill_text(i),
				'skills': this.skills[i]
			});
		}
		return sets;
		
	}, this);
}

