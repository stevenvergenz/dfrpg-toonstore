var model;
var viewModel;


function processCharacterData(data,textStatus,jqXHR)
{
	// apply modified json document to page
	model = data;
	viewModel = new SheetViewModel(data);
	ko.applyBindings(viewModel);
}

function initialize(){
	// retrieve the character sheet data
	$.getJSON( window.location.pathname + '/json', processCharacterData );
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

