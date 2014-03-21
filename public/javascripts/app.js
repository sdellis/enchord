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
	.otherwise({
		redirectTo: '/'
	});
}]);