/*
 * Angular.js controllers for charsheet components
 */

var app = angular.module('charsheet', ['ngResource']);

app.factory('Data', ['$resource', function($resource){
	return $resource('json');
}]);

function GeneralCtrl($scope, Data){
	$scope.data = {'name': Data.name, 'player': Data.player};
}
