'use strict';

var enchordControllers = angular.module('enchordControllers', []);

// Home page controller
enchordControllers.controller('HomeController', ['$scope',
	function($scope) {
		$scope.variable = 'Heemin';
	}]);

// About page controller
enchordControllers.controller('AboutController', ['$scope',
	function($scope){
	}]);

// Search page controller
enchordControllers.controller('SearchController', ['$scope', '$routeParams',
	function($scope, $routeParams) {
		$scope.query = $routeParams.query;
	}]);

// Song page (view) controller
enchordControllers.controller('ViewController', ['$scope', '$routeParams',
	function($scope, $routeParams){
		$scope.song = {songId: $routeParams.songId, title: 'Temp'}
	}]);

// Signup controller
enchordControllers.controller('SignupController', ['$scope',
	function($scope){
	}]);

// Login controller
enchordControllers.controller('LoginController', ['$scope',
	function($scope){
	}]);