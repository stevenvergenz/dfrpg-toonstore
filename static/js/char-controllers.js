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
app.controller('SkillCtrl', ['$scope','rootModel', function($scope, rootModel)
{
	$scope.data = rootModel.data;

	$scope.editing = false;
	$scope.shifted = false;

	// convenience label function
	$scope.label = function(value){
		var ladder = ['Mediocre (+0)', 'Average (+1)', 'Fair (+2)', 'Good (+3)', 'Great (+4)', 'Superb (+5)', 'Fantastic (+6)', 'Epic (+7)', 'Legendary (+8)'];
		return ladder[value];
	};

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

	// select correct list
	$scope.skills = function(level)
	{
		if( $scope.shifted )
			return $scope.data.skills.shifted_lists[level];
		else
			return $scope.data.skills.lists[level];
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

	// calculate skill points available
	$scope.pointsAvailable = function(){
		var spent = 0;
		for(var i=0; i<8; i++){
			spent += i * $scope.skills(i).length;
		}
		return $scope.data.totals.skills_total - spent;
	};

	// skill ladder validator
	$scope.valid = function(){
		var valid = true;
		if( !$scope.data.$resolved )
			return valid;

		for( var i=1; i<$scope.data.totals.skill_cap; i++ ){
			valid &= $scope.skills(i).length >= $scope.skills(i+1).length;
		}
		return (valid ? 'Valid' : 'INVALID') + ', '+$scope.pointsAvailable()+' available';
	};
}]);

