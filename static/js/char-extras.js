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

