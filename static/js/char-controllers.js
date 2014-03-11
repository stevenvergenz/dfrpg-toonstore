/*
 * Angular.js controllers for charsheet components
 */

var app = angular.module('charsheet', ['ngResource']);

app.service('rootModel', ['$rootScope', '$resource', function($rootScope, $resource){
	this._resource = $resource('json', {}, {cache:true});

	this.aspects;
	this.data = this._resource.get({}, function(value,headers){
		this.aspects = value.aspects;
	});
}]);

app.controller('GeneralCtrl', ['$scope', 'rootModel', function($scope, rootModel){
	$scope.data = rootModel.data;
	$scope.editing = false;
}]);

app.controller('AspectCtrl', ['$scope', 'rootModel', function($scope, rootModel){
	$scope.data = rootModel.data;
	$scope.editing = false;
}]);
