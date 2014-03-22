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
enchordControllers.controller('SearchController', ['$scope', '$window', '$routeParams',
	function($scope, $window, $routeParams) {
		$scope.query = $routeParams.query;
		// redirect to search page
		$scope.search = function(query) {
			console.log(query);
			if (query != undefined && query.length > 0) {
				$window.location.href = '#/search/' + query;
			}
		};
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