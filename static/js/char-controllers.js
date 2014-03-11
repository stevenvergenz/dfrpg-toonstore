/*
 * Angular.js controllers for charsheet components
 */

var app = angular.module('charsheet', ['ngResource']);

app.factory('Data', ['$resource',
	function($resource){
		return $resource('json', {}, {cache: true});
	}
]);

app.controller('GeneralCtrl', ['$scope', 'Data', function($scope,Data)
{
	$scope.data = Data.get();
	$scope.save = function(){
		Data.save();
	};

	//$scope.data = Data.get();
	//$scope.data = {'name': data.name, 'player': data.player};
	//$scope.data = Data;
}]);
