// Module - for non-loggedin users
var enchord = angular.module('enchord', ['ngRoute', 'enchordControllers']);
 
enchord.config(function($locationProvider, $routeProvider) {
  // $locationProvider.html5Mode(true);
  // $routeProvider
    // .when('/', { templateUrl: 'partials/library'})
    // .when('/search/:query', {templateUrl: 'partials/search'})
    // .when('/createband', {templateUrl: 'partials/band_create'})
    // .when('/editband/:_id', {templateUrl: 'partials/band_edit'})
    // .when('/viewband/:_id', {templateUrl: 'partials/band_view'})
    // .when('/createsong', {templateUrl: 'partials/editsong'})
    // .when('/editsong/:_id', {templateUrl: 'partials/editsong'})
    // .when('/viewsong/:_id', {templateUrl: 'partials/viewsong'})
    // // .when('/about', { templateUrl: 'partials/about'})
    // .otherwise({redirectTo:'/'});
});

enchord.factory('Side', function(){
  var pagetype = 'default';
  return {
    pagetype: function() { return pagetype; },
    setPagetype: function(newPagetype) { pagetype = newPagetype; }
  };
});

//doesn't work :(
enchord.factory('Messages', function() {
  var message = '';
  var success = false;
  return {
    getMessage: function() {console.log('here'); return message;},
    getSuccess: function() {return success;},
    setMessage: function(newmessage, newsuccess) {
      message = newmessage;
      success = newsuccess;
      console.log("this is in app");
      console.log(success);
      console.log(message);
    }
  }
});

// for pagination
enchord.filter('startFrom', function() {
	return function(input, start) {
		start = +start;
		return input.slice(start);
	}
});

// enchord.run(['$rootScope', '$route', '$window', function($rootScope, $route, $window, $routeProvider){
// 	$rootScope.$on('$locationChangeStart', function (event, next, current) {
// 		$route.reload();
// 	});
// }]);
 
// enchord.controller('ctrl', function($scope){});


// var enchord = angular.module('enchord', [
// 	'ngRoute',
// 	'enchordControllers'
// ]);

// var enchordMembers = angular.module('enchord', [
// 	'ngRoute',
// 	'enchordControllers'
// ]);

// enchord.config(function($stateProvider, $urlRouterProvider){
// 	$urlRouterProvider.otherwise('/home');

// 	$stateProvider.state('default', {
// 		url: '/home',
// 		templateUrl: 'partials/library.html'
// 	});
// });


// old routeprovider
// enchord.config(function($routeProvider) {
// 	$routeProvider.when('/',
// 	{
// 		controller: 'ProfileController',
// 		templateUrl: 'partials/library'
// 	})
// 	.when('/about', 
// 	{
// 		controller: 'AboutController',
// 		templateUrl: 'partials/about.html'
// 	})
	// .when('/search/:query',
	// {
	// 	controller: 'SearchController',
	// 	templateUrl: 'partials/search.html'
	// })
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
// });

var app = angular.module('myApp', ['ngRoute']);
 
app.config(function($locationProvider, $routeProvider) {
  // $locationProvider.html5Mode(true);
  $routeProvider
    .when('/', { templateUrl: 'partials/index', controller: 'ctrl' })
    .when('/about', { templateUrl: 'partials/about', controller: 'ctrl' })
    .otherwise({redirectTo:'/'});
});
 
app.controller('ctrl', function($scope){});

/*function isLoggedIn($httsp) {
	$http.get('/loggedin').
	success(function(data){
		if (data == 0) {
			return false;
		} else {
			return true;
		}
	}
};*/