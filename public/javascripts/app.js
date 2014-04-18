// Module - for non-loggedin users
var enchord = angular.module('enchord', [
	'ngRoute',
	'enchordControllers'
]);

var enchordMembers = angular.module('enchord', [
	'ngRoute',
	'enchordControllers'
]);

// enchord.config(['$routeProvider', function($routeProvider) {
// 	$routeProvider.when('/',
// 	{
// 		controller: 'HomeController',
// 		templateUrl: 'partials/home.html'
// 	})
// 	.when('/about', 
// 	{
// 		controller: 'AboutController',
// 		templateUrl: 'partials/about.html'
// 	})
// 	.when('/search/:query',
// 	{
// 		controller: 'SearchController',
// 		templateUrl: 'partials/search.html'
// 	})
// 	.when('/view/:songId',
// 	{
// 		controller: 'ViewController',
// 		templateUrl: 'partials/view_song.html'
// 	})
// 	.when('/edit/:songId',
// 	{
// 		controller: 'EditSongController',
// 		templateUrl: 'partials/edit_song.html',
// 		resolve: {
// 			loggedin: function($q, $http, $location) {
// 			var deferred = $q.defer();
// 			if(isLoggedIn($http) == false)
// 				console.log(false)
// 				$location.path('/login');
// 			deferred.resolve();
// 			return deferred.promise;
// 		}}
// 	})
// 	.when('/login',
// 	{
// 		controller: 'LoginController',
// 		templateUrl: 'partials/login.html'
// 	})
// 	.when('/signup',
// 	{
// 		controller: 'SignupController',
// 		templateUrl: 'partials/signup.html'
// 	})
// 	.otherwise({
// 		redirectTo: '/'
// 	});
// }]);


/*function isLoggedIn($http) {
	$http.get('/loggedin').
	success(function(data){
		if (data == 0) {
			return false;
		} else {
			return true;
		}
	}
};*/