ko.extenders.sort = function(target,dir)
{
	function sortFn(a,b){
		var result = a > b ? 1 : -1;
		return dir === 'desc' ? -result : result;
	};
	function conseqSortFn(left,right){
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
	};

	target.subscribe(function(val){
		if(val){
			if( dir == 'consequence' )
				val.sort(conseqSortFn);
			else
				val.sort(sortFn);
		}
	});
	return target;
};

ko.bindingHandlers.draggable = {
	init: function(element, valueAccessor){
		var editing = ko.utils.unwrapObservable(valueAccessor());
		$(element).draggable({revert:true, disabled: !editing});
	},
	update: function(element,valueAccessor){
		var editing = ko.utils.unwrapObservable(valueAccessor());
		$(element).draggable('option', 'disabled', !editing);
	}
};

ko.bindingHandlers.droppable = {
	init: function(element, valueAccessor){
		var editing = ko.utils.unwrapObservable(valueAccessor());
		$(element).droppable({ hoverClass: 'dropHoverRow', disabled: !editing,
			drop: function(evt,ui){
				var skill = ui.draggable.find('span').text();
				var draggedList = ko.contextFor(ui.draggable.find('span')[0]).$parent;
				var droppedList = ko.dataFor(evt.target);
				if( draggedList != droppedList ){
					draggedList.skills.remove(skill);
					if( droppedList.index != 0 ){
						droppedList.skills.push(skill);
					}
				}
			}
		});
	},
	update: function(element, valueAccessor){
		var editing = ko.utils.unwrapObservable(valueAccessor());
		$(element).droppable('option', 'disabled', !editing);
	}
};

ko.bindingHandlers.accordion = {
	init: function(element, valueAccessor){
		$(element).accordion({collapsible: true, active: false, heightStyle: 'content', icons: false});
	},
	update: function(element, valueAccessor){
		
	}
};

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
	this.registerWith = function(container){
		this.severity.subscribe(function(){
			container.valueHasMutated();
		});
		this.mode.subscribe(function(){
			container.valueHasMutated();
		});
	};
	this.editing = ko.observable(false);
}

function Power(data){
	this.cost = ko.observable(data.cost);
	this.name = ko.observable(data.name);

	this.description = ko.observableArray();
	for( var i in data.description ){
		this.description.push( ko.observable(data.description[i]) );
	}

	this.full_description = ko.computed({
		'read': function(){
			var text = '';
			for( var i in this.description() ){
				text += this.description()[i]() + '\n';
			}
			return text;
		},
		'write': function(value){
			var lines = value.split('\n');
			var descLine = 0;
			for( var inputLine=0; inputLine<lines.length; inputLine++ )
			{
				if( lines[inputLine] != '' ){
					if( descLine < this.description().length ){
						this.description()[descLine]( lines[inputLine] );
					}
					else {
						this.description.push( ko.observable( lines[inputLine] ) );
					}
					descLine++;
				}
			}
			this.description.splice(descLine, this.description().length-descLine);
		}
	}, this);
}

function escapeHtml(str){
	return $('<pre>').text(str).html();
}

function SheetViewModel(data)
{
	// initialize general data
	this.name = ko.observable(data.name);
	this.player = ko.observable(data.player);
	this.generalEditing = ko.observable(false);

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
		'aspects': ko.observableArray(),
		'editing': ko.observable(false)
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
	this.stress.editing = ko.observable(false);

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
	this.consequences = ko.observableArray().extend({sort: 'consequence'});;
	this.consequences.editing = ko.observable(false);
	for( var i in data.consequences ){
		var conseq = new Consequence(data.consequences[i]);
		conseq.registerWith(this.consequences);
		this.consequences.push( conseq );
	}

	/*this.consequences.columns = [
		ko.computed(function(){
			var l = [];
			for( var i in this.consequences() ){
				l.push( this.consequences()[i].severity );
			}
			return l;
		}, this)
	];*/

	// initialize skills data
	this.skills = {
		'lists': [
			ko.observableArray(data.skills.lists[0] ? data.skills.lists[0] : []).extend({sort:'asc'}),
			ko.observableArray(data.skills.lists[1] ? data.skills.lists[1] : []).extend({sort:'asc'}),
			ko.observableArray(data.skills.lists[2] ? data.skills.lists[2] : []).extend({sort:'asc'}),
			ko.observableArray(data.skills.lists[3] ? data.skills.lists[3] : []).extend({sort:'asc'}),
			ko.observableArray(data.skills.lists[4] ? data.skills.lists[4] : []).extend({sort:'asc'}),
			ko.observableArray(data.skills.lists[5] ? data.skills.lists[5] : []).extend({sort:'asc'}),
			ko.observableArray(data.skills.lists[6] ? data.skills.lists[6] : []).extend({sort:'asc'}),
			ko.observableArray(data.skills.lists[7] ? data.skills.lists[7] : []).extend({sort:'asc'}),
			ko.observableArray(data.skills.lists[8] ? data.skills.lists[8] : []).extend({sort:'asc'})
		],
		'editing': ko.observable(false)
	};

	// initialize powers data
	this.powers = ko.observableArray();
	for( var i in data.powers ){
		this.powers.push( new Power(data.powers[i]) );
	}
	this.powers.editing = ko.observable(false);

	// initialize totals data
	this.totals = {
		'base_refresh': ko.observable(data.totals.base_refresh),
		'skill_cap': ko.observable(data.totals.skill_cap),
		'skills_total': ko.observable(data.totals.skills_total),
		'fate_points': ko.observable(data.totals.fate_points),
		'editing': ko.observable(false)
	};

	this.totals.power_level = ko.computed(function(){
		if( this.base_refresh() < 7 ){
			return 'Feet in the Water';
		}
		else if( this.base_refresh() < 8 ){
			return 'Up to Your Waist';
		}
		else if( this.base_refresh() < 10 ){
			return 'Chest-Deep';
		}
		else {
			return 'Submerged';
		}
	}, this.totals);

	this.totals.refresh_adjustment = ko.computed(function(){
		var sum = 0;
		for( var i in this.powers() ){
			sum += parseInt(this.powers()[i].cost());
		}
		return sum;
	}, this);

	this.totals.skill_text = function(val){
		var ladder = ['Mediocre (+0)', 'Average (+1)', 'Fair (+2)', 'Good (+3)', 'Great (+4)', 'Superb (+5)', 'Fantastic (+6)', 'Epic (+7)', 'Legendary (+8)'];
		return ladder[val];
	};

	this.totals.skill_cap_text = ko.computed(function(){
		return this.skill_text(this.skill_cap());
	}, this.totals);

	this.totals.skills_spent = ko.computed(function(){
		var sum = 0;
		for( var i in this.skills.lists ){
			sum += i * this.skills.lists[i]().length;
		}
		return sum;
	}, this);

	this.totals.skills_available = ko.computed(function(){
		return this.skills_total() - this.skills_spent();
	}, this.totals);

	this.totals.adjusted_refresh = ko.computed(function(){
		return parseInt(this.base_refresh()) + this.refresh_adjustment();
	}, this.totals);

	this.skills.sets = ko.computed(function(){
		var sets = [];
		for( var i=this.totals.skill_cap(); i>=0; i-- ){
			sets.push({
				'index': i,
				'level_text': this.totals.skill_text(i),
				'skills': this.skills.lists[i]
			});
		}
		return sets;
	}, this);

	this.skills.valid = ko.computed( function(){
		var valid = true;
		for( var i=1; i<this.totals.skill_cap(); i++ ){
			var skills = this.skills.lists;
			valid &= skills[i]().length >= skills[i+1]().length;
		}
		return (valid ? 'Valid' : 'INVALID') + ', '+this.totals.skills_available()+' available';
	}, this);


	/**********************************
	 * Optional panels
	 **********************************/

	this.notes = {
		'text': ko.observable(data.notes ? data.notes.text : ''),
		'editing': ko.observable(false),
		'enabled': ko.observable(!!data.notes)
	};
	this.notes.html = ko.computed(function(){
		return markdown.toHTML(this.text());
	}, this.notes);
}

