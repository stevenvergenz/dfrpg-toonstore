var model;
var pageLoaded;
var viewModel;

// retrieve the character sheet data
$.getJSON( window.location.pathname + '/json', function(data){
	model = data;
	console.log('Data ready');
	if( pageLoaded )
		processCharacterData();
});

$(document).ready(function(){
	pageLoaded = true;
	console.log('Page ready');
	if( model )
		processCharacterData();
});

function processCharacterData()
{
	// apply modified json document to page
	console.log('Knocking out document');
	viewModel = new SheetViewModel(model);
	ko.applyBindings(viewModel);
}

function pushToServer(){
	var data = ko.toJSON(viewModel);
	//console.log(data);
	$.post( window.location.pathname + '/json', data, function(data,textStatus,xhr){
		console.log('Success');
	});
}

function removeAspect(index){
	console.log('Removing aspect at ', index);
	viewModel.aspects.aspects.splice(index,1);
}

function addAspect(){
	console.log('Adding aspect');
	viewModel.aspects.aspects.push( {name: ko.observable(), description: ko.observable()} );
}

function removeStressTrack(index){
	console.log('Removing stress track at', index);
	viewModel.stress.splice(index,1);
}

function addStressTrack(){
	console.log('Adding stress track');
	viewModel.stress.push( new StressTrack({
		'name': 'Stress',
		'skill': 'Skill',
		'toughness': 0,
		'boxes': [
			{'used':false},
			{'used':false}
		],
		'armor': []
	}) );
}

function addArmorTo(index){
	console.log('Adding armor to track', index);
	viewModel.stress()[index].armor.push( new StressArmor({
		'vs': 'source',
		'strength': 0
	}) );
}

function removeArmorFrom(track,armor){
	console.log('Removing armor', armor, 'from track', track);
	viewModel.stress()[track].armor.splice(armor,1);
}

function removeConsequence(data){
	console.log('Removing consequence', data);
	viewModel.consequences.remove(data);
}

function addConsequence(){
	console.log('Adding consequence');
	var conseq = new Consequence({
		'severity': 'Mild',
		'mode': 'Any',
		'used': false,
		'aspect': ''
	});
	conseq.registerWith(viewModel.consequences);
	viewModel.consequences.push( conseq );
}

/*function updateConseqAspect(conseq){
	var index = conseq.id.substr(-1,1);
	console.log(conseq.checked);
	if( conseq.checked ){
		console.log('Display input box');
		$( $('.conseqAspectDisplay')[index] ).hide();
		$( $('.conseqAspectEdit')[index] ).show().focus();
	}
	else {
		viewModel.consequences()[index].aspect( '' );
	}
}

function finishConseqUpdate(evt, index){
	if( evt.charCode == 13 ){
		console.log('Hiding field');
		$(evt.target).hide();
		$( $('.conseqAspectDisplay')[index] ).show();
	}
}*/

function checkReturn(obj,evt){
	if( evt.keyCode == 13 )
		$(obj).blur();
}

function focusIn(obj){
	ko.dataFor(obj).editing(true);
	$(obj).next().focus().select();
}

function focusOut(obj){
	ko.dataFor(obj).editing(false);
}

function addSkill(evt){
	var skill = $('#newSkill').val();
	if( /^\S+$/.test(skill) ){
		viewModel.skills.lists[0].push(skill);
		$('#newSkill').val('');
	}
}

function removePower(i){
	viewModel.powers.splice(i,1);
}

function addPower(){
	viewModel.powers.push( new Power({
		'cost': 0,
		'name': 'New power',
		'description': []
	}) );
}
