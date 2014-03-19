var app = angular.module('charsheet', ['ngResource']);

/*
 * Retrieve the JSON data from server
 */
app.service('rootModel', ['$rootScope','$timeout','$resource', function($rootScope,$timeout,$resource)
{
	this._resource = $resource('json', {}, {
		'get': {
			'method': 'GET',
			'transformResponse': function(data,headers){
				$timeout(function(){$rootScope.$broadcast('is_clean');}, 500);
				return angular.fromJson(data);
			}
		},
		'save': {
			'method': 'POST',
			'transformResponse': function(data,headers){
				$timeout(function(){$rootScope.$broadcast('is_clean');}, 500);
				return angular.fromJson(data);
			}
		}
	});

	this.data = this._resource.get();

	$rootScope.data = this.data;

	$rootScope.$on('is_dirty', function(){ $rootScope.dirty = true; });
	$rootScope.$on('is_clean', function(){ $rootScope.dirty = false; });
}]);

app.directive('dgyNotify', function()
{
	return {
		'restrict': 'A',
		'link': function(scope,element,attr){
			if( attr.ngModel ){
				scope.$watch(attr.ngModel, function(newVal,oldVal){
					scope.$emit('is_dirty');
				});
			}
		}
	};
});

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
			element.draggable({
				'revert': true,
				'disabled': !scope.enabled()
			});

			// update draggable property based on enabled
			scope.$watch(scope.enabled, function(){
				element.draggable('option', 'disabled', !scope.enabled());
			});

			// cleanup
			element.bind('$destroy', function(){
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
			'enabled': '&dgyDroppable',
			'callback': '&dgyDrop'
		},
		'link': function(scope,element,attr)
		{
			// initialize
			element.droppable({
				'disabled': !scope.enabled(),
				'hoverClass': 'hoverDropTarget',
				'drop': scope.callback()
			});

			scope.$watch(scope.enabled, function(){
				element.droppable('option', 'disabled', !scope.enabled());
			});

			// cleanup
			element.bind('$destroy', function(){
				element.droppable('destroy');
			});
		}
	};
});

app.service('SharedResources', ['rootModel', function(rootModel)
{
	var self = this;
	self.shifted = false;

	// select correct list
	self.skills = function(level)
	{
		if( !rootModel.data.$resolved )
			return [];

		if( self.shifted )
			return rootModel.data.skills.shifted_lists[level];
		else
			return rootModel.data.skills.lists[level];
	};

	// convenience label function
	self.skillLabel = function(value){
		var ladder = ['Mediocre (+0)', 'Average (+1)', 'Fair (+2)', 'Good (+3)', 'Great (+4)', 'Superb (+5)', 'Fantastic (+6)', 'Epic (+7)', 'Legendary (+8)'];
		return ladder[value];
	};

	self.skillPointsSpent = function(){
		var spent = 0;
		for(var i=0; i<8; i++){
			spent += i * self.skills(i).length;
		}
		return spent;
	};

	// calculate skill points available
	self.skillPointsAvailable = function(){
		if( !rootModel.data.$resolved )
			return;
		else
			return rootModel.data.totals.skills_total - self.skillPointsSpent();
	};

	self.refreshSpent = function(){
		if( !rootModel.data.$resolved )
			return;

		var total = 0;
		for( var i=0; i<rootModel.data.powers.length; i++ ){
			total += rootModel.data.powers[i].cost;
		}
		return total;
	};

	self.adjustedRefresh = function(){
		if( !rootModel.data.$resolved )
			return;

		return rootModel.data.totals.base_refresh + self.refreshSpent();
	};
}]);

// special global-scope function to upload avatar
function uploadAvatar()
{
	var formData = new FormData($('div#avatar form')[0]);
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

