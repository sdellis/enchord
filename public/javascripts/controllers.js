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
		$scope.query = "";
		$scope.type = "Both";
		// redirect to search page
		$scope.search = function(query) {
			console.log(query);
			if (query != undefined && query.length > 0) {
				$window.location.href = '/search/' + query;
			}
		};
	}]);

// Song page (view) controller
enchordControllers.controller('ViewController', ['$scope', '$routeParams',
	function($scope, $routeParams){
		$scope.song = {songId: $routeParams.songId, title: 'Temp'}
	}]);

// Song page (edit) controller
enchordControllers.controller('SongEditController', ['$scope', '$routeParams', '$http', '$window',
	function($scope, $routeParams, $http, $window){ 
		$scope.isNew = true;
		$scope.hasError = false;
  		var win = $window;
  		$scope.$watch('songEditForm.$dirty', function(value) {
    		if(value && !($scope.isNew)) {
      			win.onbeforeunload = function(){
        			return 'You have unsaved changes.';
      			};
    		} else {
    			win.onbeforeunload = function(){};
    		}
  		});
		$scope.parse = function() {
			//readLines($scope.song.data, function(data){$scope.song.result = data});
			/*console.log($scope.song.data);
			$http({
				method  : 'GET',
				url     : '/parsesong',
				params  : { data : $scope.song.data }
				//headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data) {
				console.log(data);
				$scope.song.result = data + " parsed";
			});*/
			$http({
				method  : 'POST',
				url     : '/parsesong',
				data    : $.param($scope.song),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data) {
				console.log(data);
				$scope.song.result = data + " parsed";
			});
		}

		$scope.init = function(_id) {
			console.log(_id);
			if(_id != undefined && _id.length != 0) {
				var getUrl = '/findsong/' + _id;
				$http({
					method  : 'GET',
					url     : getUrl
				}).success(function(data) {
					console.log(data);
					$scope.song = data.song;
					$scope.parse();
				}).error(function(data, status) {
					console.log(data);
					console.log(status);
					if (status == 500) {
						console.log(status);
						$scope.message = data.message;
						$scope.hasError = data.hasError;
					}
				});
			} else {
				$scope.song = {
					title: '',
					artist: '',
					genre: '',
					data: '',
					_id: '',
					pub: true
				};
				$scope.parse();
			}

		}

		$scope.createsong = function() {
			console.log("create " + $scope.song.title);
			console.log($scope.song);
			$http({
				method  : 'POST',
				url     : '/createsong',
				data    : $.param($scope.song),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data){
				console.log(data);
				
				// go to edit page
				var url = '/editsong/' + data.song._id;
				$window.location.href = url;

				//$scope.song = data.song;
				//$scope.message = data.message;
				//$scope.hasError = data.hasError;
				//$scope.isNew = data.isNew;
				//$scope.songEditForm.$setPristine();
			}).error(function(data, status) {
				console.log(data);
				console.log(status);
				if (status == 500) {
					console.log(status);
					$scope.message = data.message;
					$scope.hasError = data.hasError;
				}
			});
		}
		$scope.editsong = function() {
			console.log("edit " + $scope.song.title);
			$http({
				method  : 'POST',
				url     : '/editsong',
				data    : $.param($scope.song),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data){
				console.log(data);
				$scope.message = data.message;
				$scope.hasError = data.hasError;
				$scope.isNew = data.isNew;
				$scope.songEditForm.$setPristine();
			}).error(function(data, status) {
				console.log(data);
				console.log(status);
				if (status == 500) {
					console.log(status);
					$scope.message = data.message;
					$scope.hasError = data.hasError;
				}
			});
		}
		$scope.deletesong = function() {
			console.log("delete " + $scope.song.title);
			$http({
				method  : 'POST',
				url     : '/deletesong',
				data    : $.param($scope.song),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data){
				console.log(data);
				if (data.isDeleted == true) {
					// redirect to different page later
					$window.location.href = '/members';
				}
				$scope.message = data.message;
				$scope.hasError = data.hasError;
				$scope.isNew = data.isNew;
			}).error(function(data, status) {
				console.log(data);
				console.log(status);
				if (status == 500) {
					console.log(status);
					$scope.message = data.message;
					$scope.hasError = data.hasError;
				}
			});
		}
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

// Reset Password controller
enchordControllers.controller('ResetPasswordController', ['$scope',
	function($scope){
		$scope.passMatch = true;
		// check that passwords match
		$scope.checkPass = function() {
			$scope.passMatch = $scope.resetForm.password.$viewValue == $scope.resetForm.password_repeat.$viewValue;
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