/*
 * Angular.js controllers for charsheet components
 */

var app = angular.module('charsheet', ['ngResource']);

/*
 * Retrieve the JSON data from server
 */
app.service('rootModel', ['$rootScope', '$resource', function($rootScope, $resource)
{
	this._resource = $resource('json', {}, {cache:true});

	this.data = this._resource.get();
}]);


/*
 * Custom directive to enable drag/dropping
 */

app.directive('dgyDraggable', function()
{
	return {
		'restrict': 'A',
		'scope': {
			'enabled': '&dgyDraggable'
		},
		'link': function(scope,element,attr)
		{
			// initialize
			console.log('init false');
			element.draggable({
				'revert': 'invalid',
				'disabled': !scope.enabled()
			});

			// update draggable property based on enabled
			scope.$watch(scope.enabled, function(){
				element.draggable('option', 'disabled', !scope.enabled());
			});

			// cleanup
			element.on('$destroy', function(){
				element.draggable('destroy');
			});
		}
	};
});

app.directive('dgyDroppable', function()
{
	return {
		'restrict': 'A',
		'scope': {
			'enabled': '&dgyDroppable'
		},
		'link': function(scope,element,attr)
		{
			
		}
	};
});


/**********************************************
 * Panel Controllers
 **********************************************/

// handle general panel

function GeneralCtrl($scope, rootModel)
{
	$scope.data = rootModel.data;
	$scope.editing = false;
}


// handle aspects

function AspectCtrl($scope, rootModel)
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
}


// skill block and dependencies
function SkillCtrl($scope, rootModel)
{
	$scope.data = rootModel.data;

	$scope.editing = false;
	$scope.shifted = false;

	// data.skills.lists
	// data.skills.shifted_lists
	$scope.label = function(value){
		var ladder = ['Mediocre (+0)', 'Average (+1)', 'Fair (+2)', 'Good (+3)', 'Great (+4)', 'Superb (+5)', 'Fantastic (+6)', 'Epic (+7)', 'Legendary (+8)'];
		return ladder[value];
	};

	$scope.presOrder = function(){
		var arr = [];
		if( ! $scope.data.$resolved )
			return arr;

		for(var i=$scope.data.totals.skill_cap; i>=0; i--){
			arr.push(i);
		}
		return arr;
	};

	$scope.skills = function(level)
	{
		if( $scope.shifted )
			return $scope.data.skills.shifted_lists[level];
		else
			return $scope.data.skills.lists[level];
	};
}


// special global-scope function to upload avatar
function uploadAvatar()
{
	console.log('stuff');
	var formData = new FormData($('form')[0]);
	$.ajax({
		'url': 'avatar',
		'type': 'POST',
		'contentType': false,
		'processData': false,
		'cache': false,
		'data': formData,

		'success': function(data,status,xhr){
			$('#avatar > #imgContainer > img')[0].src = 'avatar';
		},
		'error': function(xhr,status,err){
			console.log(err, status);
		}
	});
};

