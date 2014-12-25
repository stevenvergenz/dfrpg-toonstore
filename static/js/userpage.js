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


app.directive('dgyFallback', function()
{
	return {
		restrict: 'A',
		link: function(scope,element,attr){
			element.bind('error', function(evt){
				if( element[0].src !== attr.dgyFallback )
					element[0].src = attr.dgyFallback;
			});
		}
	};
});

$(function(){
	angular.bootstrap( $('.content-block')[0], ['userpage'] );
});
