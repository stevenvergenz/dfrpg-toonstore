var app = angular.module('userpage', ['ngResource','ngCookies']);

app.controller('UserPageCtrl', ['$scope','$resource','$cookies', function($scope,$resource,$cookies)
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

	$scope.sortField = $cookies.sortField || 'last_updated';
	$scope.sortReverse = $cookies.sortReverse === undefined || $cookies.sortReverse === 'true';

	$scope.setSort = function(field)
	{
		if( field === $scope.sortField ){
			$scope.sortReverse = !$scope.sortReverse;
		}
		else {
			$scope.sortField = field;
			$scope.sortReverse = false;
		}
		$scope.setCookies();
	};

	$scope.setCookies = function()
	{
		var qualifiers = ';path="'+window.location.pathname+'";max-age=31536000;';
		document.cookie = 'sortField='+$scope.sortField + qualifiers;
		document.cookie = 'sortReverse='+angular.toJson($scope.sortReverse) + qualifiers;
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
		return moment(isotime).locale(localeInfo.pathLocale).fromNow();
	};
});

app.filter('calendarTime', function()
{
	return function(isotime){
		return moment(isotime).locale(localeInfo.pathLocale).calendar();
	};
});

$(function(){
	angular.bootstrap( $('div.wrapper')[0], ['userpage'] );
});
