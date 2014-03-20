var mysql = require('mysql');
var libpath = require('path');
var fs = require('fs');

var global = require('./global.js');


var filename = process.argv[2];
var toon = JSON.parse(fs.readFileSync(filename));

/*var connection = mysql.createConnection( global.config.database );
connection.query('UPDATE Characters SET info = ? WHERE canonical_name = "lifeson" AND owner = "Derogatory";', [JSON.stringify(file)],
	function(err,rows,fields){
		if(err){
			console.log(err);
		}
		else {
			console.log(rows.message);
			console.log('Success');
		}
		connection.end();
	}
);*/

var newtoon = {};
newtoon.name = toon.name;
newtoon.player = toon.player;

// no changes to aspects model
newtoon.aspects = toon.aspects;

// simple cleanup on skills, guarantee shifted lists
newtoon.skills = {};
newtoon.skills.lists = toon.skills.lists;
newtoon.skills.is_shifter = toon.skills.is_shifter || false;
newtoon.skills.shifted_lists = toon.skills.shifted_lists || [[],[],[],[],[],[],[],[],[]];

// cleanup on totals
newtoon.totals = {
    "base_refresh": parseInt(toon.totals.base_refresh),
    "skill_cap": parseInt(toon.totals.skill_cap),
    "skills_total": parseInt(toon.totals.skills_total),
    "fate_points": parseInt(toon.totals.fate_points)
};

// clean up, modify stress format
newtoon.stress = [];
for(var i in toon.stress)
{
	var track = toon.stress[i];
	var newtrack = {};
	newtrack.name = track.name;
	newtrack.skill = track.skill;
	newtrack.toughness = parseInt(track.toughness);

	newtrack.armor = [];
	for(var j in track.armor){
		newtrack.armor.push( {
			'strength': parseInt(track.armor[j].strength),
			'vs': track.armor[j].vs
		} );
	}

	newtrack.strength = parseInt(track.strength) || track.boxes.length;
	newtrack.boxes = [];
	for(var j=0; j<8; j++){
		newtrack.boxes.push( track.boxes[j] ? track.boxes[j].used : null );
	}

	newtoon.stress.push(newtrack);
}

// clean up consequences
newtoon.consequences = [];
for(var i in toon.consequences)
{
	var conseq = toon.consequences[i];
	var newconseq = {};

	newconseq.severity = conseq.severity;
	newconseq.mode = conseq.mode;
	newconseq.aspect = conseq.aspect;

	newtoon.consequences.push(newconseq);
}

newtoon.powers = [];
for(var i in toon.powers)
{
	var power = toon.powers[i];
	var newpower = {};

	newpower.cost = parseInt(power.cost);
	newpower.name = power.name;
	newpower.description = power.full_description || power.description.join('\n') || '';

	newtoon.powers.push(newpower);
}

newtoon.notes = {
	'text': toon.notes ? toon.notes.text : '',
	'enabled': toon.notes ? toon.notes.enabled || false : false
};

console.log( JSON.stringify(newtoon, null, 4) );
