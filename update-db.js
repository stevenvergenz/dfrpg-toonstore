var mysql = require('mysql');
var libpath = require('path');
var fs = require('fs');

var global = require('./global.js');

var connection = mysql.createConnection( global.config.database );
connection.query('SELECT owner,canonical_name,info FROM Characters;', function(err,rows,fields)
{
	if( err ){
		console.log(err);
		connection.end();
		return;
	}

	for(var i in rows)
	{
		var newtoon = transformCharacter( JSON.parse(rows[i].info) );
		connection.query('UPDATE Characters SET info = ? WHERE canonical_name = ? AND owner = ?;',
			[JSON.stringify(newtoon), rows[i].canonical_name, rows[i].owner],
			function(err){
				if(err){
					console.log(err);
					connection.end();
					return;
				}
				else {
					console.log(rows[i].canonical_name, 'updated');
				}
			}
		);
	}
	connection.end();
});


function transformCharacter(toon)
{
	var newtoon = {};
	newtoon.name = toon.name;
	newtoon.player = toon.player;

	// no changes to aspects model
	newtoon.aspects = {
		'high_concept': toon.aspects.high_concept,
		'trouble': toon.aspects.trouble,
		'aspects': toon.aspects.aspects
	};

	// simple cleanup on skills, guarantee shifted lists
	newtoon.skills = {};
	newtoon.skills.lists = toon.skills.lists.length>0 ? toon.skills.lists : [[],[],[],[],[],[],[],[],[]];
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
		'enabled': toon.notes && toon.notes.enabled ? toon.notes.enabled : false
	};

	return newtoon;
}

