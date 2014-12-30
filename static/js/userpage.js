var app = angular.module('userpage', ['ngResource']);

app.controller('UserPageCtrl', ['$scope','$resource', function($scope,$resource)
{
	$scope._resource = $resource(window.location.pathname+'.json', {}, {
		'get': {
			'method': 'GET',
			'isArray': true,
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

	$scope.togglePrivacyIcon = function(private){
		if(private)
			return '/static/img/glyphicons/glyphicons_051_eye_open.png';
		else
			return '/static/img/glyphicons/glyphicons_052_eye_close.png';
	};

	$scope.sortField = 'last_updated';
	$scope.sortReverse = true;

	$scope.setSort = function(field)
	{
		if( field === $scope.sortField ){
			$scope.sortReverse = !$scope.sortReverse;
		}
		else {
			$scope.sortField = field;
			$scope.sortReverse = false;
		}
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
		if(isotime)
			return 'Last updated '+moment(isotime).fromNow();
		else
			return 'Never updated';
	};
});

app.filter('calendarTime', function()
{
	return function(isotime){
		if(isotime)
			return moment(isotime).calendar();
		else
			return 'Never updated';
	};
});

$(function(){
	angular.bootstrap( $('.content-block')[0], ['userpage'] );
});
