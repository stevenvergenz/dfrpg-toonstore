var app = angular.module('userpage', ['ngResource']);

app.controller('UserPageCtrl', ['$scope','$resource', function($scope,$resource)
{
	$scope._resource = $resource(window.location.pathname+'.json', {}, {
		'get': {
			'method': 'GET',
			'transformResponse': function(data,headers){
				return angular.fromJson(data);
			}
		}
	});

	$scope.data = $scope._resource.get();

	$scope.togglePrivacy = function(toonName){
		$.post('/togglePrivacy', {id: toonName}, function(data,status,xhr)
		{
			window.location.reload(true);
		});
	};

}]);


app.directive('dgySrc', function()
{
	return {
		restrict: 'A',
		link: function(scope,element,attr)
		{
			var fallback = '/static/img/no-avatar.png';

			element.bind('error', function(evt){
				if( attr['src'] !== fallback )
					element.attr('src', fallback);
			});

			element.attr('src', attr.dgySrc);
		}
	};
});


app.filter('relativeTime', function()
{
	return function(isotime){
		return moment(isotime).fromNow();
	};
});


$(function(){
	angular.bootstrap( $('.content-block')[0], ['userpage'] );
});
