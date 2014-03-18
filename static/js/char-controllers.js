/*
 * Angular.js controllers for charsheet components
 */

var app = angular.module('charsheet');

/**********************************************
 * Panel Controllers
 **********************************************/

// handle general panel

app.controller('GeneralCtrl', ['$scope','rootModel', function($scope, rootModel)
{
	$scope.data = rootModel.data;
	$scope.editing = false;
}]);


// handle aspects

app.controller('AspectCtrl', ['$scope','rootModel', function($scope, rootModel)
{
	$scope.data = rootModel.data;
	$scope.editing = false;

	$scope.addAspect = function(){
		console.log('Adding aspect');
		$scope.data.aspects.aspects.push( {name: '', description: ''} );
	};

	$scope.removeAspect = function(index){
		console.log('Removing aspect at ', index);
		$scope.data.aspects.aspects.splice(index,1);
	};
}]);


// skill block and dependencies
app.controller('SkillCtrl', ['$scope','rootModel','SharedResources', function($scope, rootModel, SharedResources)
{
	$scope.data = rootModel.data;
	$scope.editing = false;

	$scope.shifted = false;
	$scope.skills = SharedResources.skills;
	$scope.label = SharedResources.skillLabel;

	$scope.$watch('shifted', function(newVal){
		SharedResources.shifted = newVal;
	});

	// correct ordering of skill groups
	$scope.presOrder = function(){
		var arr = [];
		if( ! $scope.data.$resolved )
			return arr;

		for(var i=$scope.data.totals.skill_cap; i>=0; i--){
			arr.push(i);
		}
		return arr;
	};


	// skill ladder validator
	$scope.valid = function(){
		var valid = true;
		if( !$scope.data.$resolved )
			return valid;

		for( var i=1; i<$scope.data.totals.skill_cap; i++ ){
			valid &= SharedResources.skills(i).length >= SharedResources.skills(i+1).length;
		}
		return (valid ? 'Valid' : 'INVALID') + ', '+SharedResources.skillPointsAvailable()+' available';
	};


	// add new skill
	$scope.addSkill = function(skillName)
	{
		$scope.skills(0).push(skillName);
		$scope.skills(0).sort();
	};


	// drag-drop handler
	$scope.dropHandler = function(evt, ui)
	{
		var skill = ui.draggable.find('span').first().text();
		var draggedLevel = angular.element(ui.draggable).parent().scope().level;
		var droppedLevel = angular.element(evt.target).scope().level;
		
		if( draggedLevel != droppedLevel )
		{
			// remove from old group
			var pos = $scope.skills(draggedLevel).indexOf(skill);
			$scope.skills(draggedLevel).splice(pos,1);

			// add to new group (if not removing)
			if( droppedLevel != 0 ){
				$scope.skills(droppedLevel).push(skill);
				$scope.skills(droppedLevel).sort();
			}

			// update ui
			$scope.$apply();

			console.log('Moved skill from', draggedLevel, 'to', droppedLevel);
		}
	};

}]);


app.controller('TotalsCtrl', ['$scope','rootModel','SharedResources', function($scope,rootModel,SharedResources)
{
	$scope.data = rootModel.data;
	$scope.editing = false;

	$scope.skillLabel = SharedResources.skillLabel;
	$scope.skillPointsSpent = SharedResources.skillPointsSpent;
	$scope.skillPointsAvailable = SharedResources.skillPointsAvailable;
	$scope.adjustedRefresh = SharedResources.adjustedRefresh;

	$scope.powerLevel = function()
	{
		if( !$scope.data.$resolved ){
			return '';
		}
		else if( $scope.data.totals.base_refresh < 7 ){
			return 'Feet in the Water';
		}
		else if( $scope.data.totals.base_refresh < 8 ){
			return 'Up to Your Waist';
		}
		else if( $scope.data.totals.base_refresh < 10 ){
			return 'Chest-Deep';
		}
		else {
			return 'Submerged';
		}
	};
}]);


app.controller('StressCtrl', ['$scope','rootModel', function($scope, rootModel)
{
	$scope.editing = false;
	$scope.data = rootModel.data;

	$scope.boxes = function(trackIndex)
	{
		if( $scope.data.stress.length <= trackIndex )
			return [];

		var track = $scope.data.stress[trackIndex];
		if( !track.boxes )
			track.boxes = [];

		while( track.boxes.length < track.strength )
			track.boxes.push( false );

		return track.boxes.slice(0, track.strength);
	};

	$scope.manageParens = function(trackIndex, boxIndex)
	{
		var classes = [];
		if( ! $scope.data.$resolved )
			return classes;

		var track = $scope.data.stress[trackIndex];
		if( track && track.toughness != 0 && boxIndex == track.boxes.length-track.toughness )
			classes.push('leftParen');
		if( track && track.toughness != 0 && boxIndex == track.boxes.length-1 )
			classes.push('rightParen');
		return classes;
	};

	$scope.armorText = function(trackIndex, armorIndex)
	{
		var armor = $scope.data.stress[trackIndex].armor[armorIndex];
		return 'Armor: '+armor.strength+' vs '+armor.vs;
	};

	$scope.addArmorTo = function(trackIndex){
		$scope.data.stress[trackIndex].armor.push( {vs:'source', strength:0} );
	};

	$scope.deleteTrack = function(trackIndex){
		$scope.data.stress.splice(trackIndex,1);
	};
}]);

