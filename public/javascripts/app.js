var enchord = angular.module('enchord', [
	'ngRoute',
	'enchordControllers'
]);

enchord.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/',
	{
		controller: 'HomeController',
		templateUrl: 'partials/home.html'
	})
	.when('/about', 
	{
		controller: 'AboutController',
		templateUrl: 'partials/about.html'
	})
	.when('/search/:query',
	{
		controller: 'SearchController',
		templateUrl: 'partials/search.html'
	})
	.when('/view/:songId',
	{
		controller: 'ViewController',
		templateUrl: 'partials/view_song.html'
	})
	.when('/login',
	{
		controller: 'LoginController',
		templateUrl: 'partials/login.html'
	})
	.when('/signup',
	{
		controller: 'SignupController',
		templateUrl: 'partials/signup.html'
	})
	.otherwise({
		redirectTo: '/'
	});
}]);