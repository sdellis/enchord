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

// Search page controller CHANGE TO LOCATION PATH
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

// Song page (edit) controller
enchordControllers.controller('SongEditController', ['$scope', '$routeParams',
	function($scope, $routeParams){ 
		
	}]);

// Signup controller
enchordControllers.controller('SignupController', ['$scope',
	function($scope){
		$scope.passMatch = true;
		// check that passwords match
		$scope.checkPass = function() {
			$scope.passMatch = $scope.signupForm.password.$viewValue == $scope.signupForm.password_repeat.$viewValue;
			// console.log($scope.signupForm.password_repeat.$viewValue);
			// console.log($scope.passMatch)
		}
	}]);
// .directive('validPasswordC', function () {
//     return {
//         require: 'ngModel',
//         link: function (scope, elm, attrs, ctrl) {
//             ctrl.$parsers.unshift(function (viewValue, $scope) {
//                 var noMatch = (viewValue != scope.signupForm.password.$viewValue || viewValue != scope.signupForm.password_repeat.$viewValue)
//                 console.log(noMatch)
//                 ctrl.$setValidity('noMatch', !noMatch)
//             })
//         }
//     }
// });

// Login controller
enchordControllers.controller('LoginController', ['$scope',
	function($scope){
		// $scope.u_error = false;
		// $scope.p_error = false;
		// $scope.error_message = "";

	}]);