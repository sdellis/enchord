'use strict';
var cleanSong = function(song) {
	if (song.title == undefined)
		song.title="";
	if (song.artist == undefined)
		song.artist="";
	if (song.genre == undefined)
		song.genre="";
	if (song.data == undefined)
		song.data="";
	if (song._id == undefined)
		song._id="";
	if (song.pub == undefined)
		song.pub=true;
	return song;
}
var getDate = function() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	var h = today.getHours();
	var m = today.getMinutes();
	var s = today.getSeconds();
	var ms = today.getMilliseconds();

	if(dd<10) {
    	dd='0'+dd
	} 
	if(mm<10) {
    	mm='0'+mm
	}
	if(h<10) {
    	h='0'+h
	} 
	if(m<10) {
    	m='0'+m
	} 
	if(s<10) {
    	s='0'+s
	} 
	if(ms<10) {
    	ms='0'+ms
	} 
	today = mm+dd+yyyy+h+m+s+ms;
	return today;
}

var enchordControllers = angular.module('enchordControllers', ['ngSanitize']);

// Home page controller
enchordControllers.controller('HomeController', ['$scope',
	function($scope) {
	}]);

// About page controller
enchordControllers.controller('AboutController', ['$scope',
	function($scope){
	}]);
enchordControllers.controller('ProfileController', [
	'$scope', 
	'$http', 
	'$location',
	'$route',
	'$window',
	'Side',
	function($scope, $http, $location, $route, $window, Side){
		$scope.currentPage = 0;
		$scope.pageSizes = [10, 25, 50];
		$scope.pageSize = 10;
		$scope.predicate = 'upvote';
		$scope.reverse = false;
		$scope.Side = Side;
		$scope.usersongs = [];
		$scope.userfolders = [];
		$scope.init = function() {
			Side.setPagetype('default');
			$http({
				method  : 'GET',
				url     : '/mysongs'
			}).success(function(data) {
				console.log(data);
				$scope.usersongs = data.usersongs;
			}).error(function(data, status) {
				console.log(data);
				console.log(status);
				if (status == 500) {
					console.log(status);
					$scope.message = data.message;
					$scope.hasError = data.hasError;
				}
			});
			$http({
				method  : 'GET',
				url     : '/myfolders'
			}).success(function(data) {
				console.log(data);
				$scope.userfolders = data.userfolders;
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
		$scope.numberOfPages = function() {
			if ($scope.usersongs.length == 0)
				return 1;
			return Math.ceil($scope.usersongs.length/$scope.pageSize);
		}
		$scope.setPredicate = function(predicate) {
			$scope.predicate = predicate;
			$scope.reverse = !$scope.reverse;
		}
	}]);

// Change PW controller
enchordControllers.controller('ChangePasswordController', [
	'$scope',
	'$http',
	'Messages',
	function($scope, $http, Messages) {
		$scope.pass = {};
		$scope.message = "";
		$scope.success;
		$scope.changePassword = function() {
			console.log($scope.pass);
			$http({
				method  : 'POST',
				url     : '/changepassword',
				data    : $.param($scope.pass),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data) {
				console.log(data);
				$scope.pass = {};
				$scope.message = data.message;
				$scope.success = data.success;
				// Messages.setMessage(data.message, data.success);
			}).error(function(data, status) {
				console.log("this is a changepw error");
				$scope.pass = {};
				$scope.message = data.message;
				$scope.success = data.success;
				//Messages.setMessage(data.message, data.success);
			});
		};
	}]);

// Search page controller 
enchordControllers.controller('SearchController', [
	'$scope', 
	'$window', 
	'$routeParams', 
	'$location', 
	'$http',
	'Side',
	function($scope, $window, $routeParams, $location, $http, Side) {
		$scope.currentPageGlobal = 0;
		$scope.pageSizesGlobal = [5, 10, 25, 50];
		$scope.pageSizeGlobal = 5;
		$scope.currentPageLocal = 0;
		$scope.pageSizesLocal = [5, 10, 25, 50];
		$scope.pageSizeLocal = 5;
		$scope.query = "";
		$scope.isAdvSearch = false;
		$scope.globalresults = [];
		$scope.localresults = [];
		// $scope.type = "Both";
		// $scope.advquery = {}
		// $scope.init = function(query, type, title, artist, genre, author) {
		// 	$scope.query = query;
		// 	$scope.type = type;
		// 	$scope.advquery = {
		// 		title: title,
		// 		artist: artist,
		// 		genre: genre,
		// 		author: author
		// 	};
		// }
		$scope.$watch('pageSizeLocal', function(value) {
			console.log('here');
			$scope.currentPageLocal = 0;
		})
		$scope.$watch('pageSizeGlobal', function(value) {
			console.log('here');
			$scope.currentPageGlobal = 0;
		})
		$scope.init = function(query, adv, title, artist, genre, author) {
			Side.setPagetype('search');
			$scope.query = query;
			$scope.title = title;
			$scope.artist = artist;
			$scope.genre = genre;
			$scope.author = author;
			console.log(adv);
			if (adv == false) {
				$scope.isAdvSearch = false;
				console.log(adv);
				console.log("basic");
				if (query != undefined && query.length > 0) {
					$http({
						method : 'GET',
						url    : '/search',
						params : { query : query }
					}).success(function(data) {
						console.log(data);
						$scope.globalresults = data.results.global;
						$scope.localresults = data.results.local;
					});
				}
			// }
			} else {
				$scope.isAdvSearch = true;
				console.log("adv");
				$http({
					method : 'GET',
					url    : '/advsearch',
					params : { title: title, artist: artist, genre: genre, author: author }
				}).success(function(data) {
						console.log(data);
						$scope.globalresults = data.results.global;
						$scope.localresults = data.results.local;
				});
			}
		}
		// redirect to search page
		$scope.search = function() {
			console.log($scope.query);
			if ($scope.query != undefined && $scope.query.length > 0) {
				$window.location.href = '/searchresults/' + $scope.query;
			}
		}
		$scope.toggleBasicSearch = function() {
			$scope.isAdvSearch = false;
		}
		$scope.toggleAdvSearch = function() {
			$scope.isAdvSearch = true;
		}
		$scope.numberOfPagesGlobal = function() {
			if ($scope.globalresults.length == 0)
				return 1;
			return Math.ceil($scope.globalresults.length/$scope.pageSizeGlobal);
		}
		$scope.numberOfPagesLocal = function() {
			if ($scope.localresults.length == 0)
				return 1;
			return Math.ceil($scope.localresults.length/$scope.pageSizeLocal);
		}

		$scope.setPredicateLocal = function(predicate) {
			$scope.predicate = predicate;
			$scope.reverse = !$scope.reverse;
		}

		$scope.setPredicateGlobal = function(predicate) {
			$scope.predicate = predicate;
			$scope.reverse = !$scope.reverse;
		}
	}]);

// Song page (view) controller
enchordControllers.controller('SongViewController', [
	'$scope', 
	'$http', 
	'$window', 
	'$routeParams', 
	'$sce',
	function($scope, $http, $window, $routeParams, $sce){
		$scope.song = {};
		$scope.voted = false;
		$scope.isLoggedIn = false;
		$scope.isAuthor = false;
		$scope.transposed = 0;
		$scope.hasvoted = function() {
			$http({
				method : 'GET',
				url    : '/hasvoted',
				params : { _id : $scope.song._id }
			}).success(function(data) {
				console.log(data);
				$scope.voted = data.voted;
			});
		}
		$scope.hasAuthor = function() {
			$http({
				method : 'GET',
				url    : '/isAuthor',
				params : { _id : $scope.song._id }
			}).success(function(data) {
				console.log(data);
				$scope.isAuthor = data.isAuthor;
			});
		}
		$scope.init = function(_id, isLoggedIn) {
			$scope.isLoggedIn = isLoggedIn;
			if(_id != undefined && _id.length != 0) {
				var getUrl = '/findsong/' + _id;
				$http({
					method  : 'GET',
					url     : getUrl
				}).success(function(data) {
					console.log(data);
					$scope.song = data.song;
					$scope.parsehtml();
					if (isLoggedIn) {
						$scope.hasvoted();
						$scope.hasAuthor();
					}
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
					upvote: 0,
					pub: true
				};
				$scope.parsehtml();
			}
		}
		$scope.gotoeditsong = function() {
			$window.location.href = "/members/editsong/" + $scope.song._id;
		}
		$scope.copysong = function() {
			// by default set public value to false
			$scope.song.pub = false;
			$http({
				method  : 'POST',
				url     : '/createsong',
				data    : $.param($scope.song),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data){
				console.log(data);
				
				// go to edit page
				var url = '/members/editsong/' + data.song._id;
				$window.location.href = url;
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
		$scope.downloadpdf = function() {
			// var doc = new jsPDF();
			// doc.fromHTML($('#chord_sheet').get(0), 15, 15, {
			// 	'width': 170
			// });
			// doc.save('Test.pdf');
			html2canvas($('#chord_sheet'), {
    			onrendered: function(canvas) {
    				console.log(canvas);
    				var data = canvas.toDataURL('image/png');
    				// var data = canvas.toDataURL('application/pdf');
    				// $('.container').append('<a href=\"' + data + '\">Download pdf</a>');
    				var i = new Image(); 
					// i.onload = function(){
					// 	alert( i.width+", "+i.height );
					// };

					i.src = data;
					console.log(data);
    				var doc = new jsPDF();
					doc.addImage(data, 'PNG', 15, 15, i.width/4, i.height/4);
			 		// generate proper filename
			 		var titlewords = $scope.song.title.split(" ");
						var filename = "";
						for (var i = 0; i < titlewords.length; i++) {
							if (i == titlewords.length - 1) {
								filename = filename + titlewords[i] + ".pdf";
							} else {
								filename = filename + titlewords[i] + "_";
							}
						}
			 		doc.save(filename);
        		// canvas is the final rendered <canvas> element
    			}
			});
		}

		$scope.downloadtxt = function() {
			$window.location.href = '/downloadsongtxt/' + $scope.song._id;
		}
		
		$scope.parsehtml = function() {
			$http({
				method  : 'POST',
				url     : '/parsesonghtml',
				data    : $.param($scope.song),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data) {
				console.log(data);
				$scope.song.result = data;
			});
		}
		// Guarantee that returned html is clean
		$scope.parsedResult = function() {
			return $sce.trustAsHtml($scope.song.result);
		}
		//upvote
		$scope.upvote = function() {
			$http({
				method : 'POST',
				url : '/upvote',
				data : $.param($scope.song),
				headers : {'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data) {
				console.log(data);
				$scope.song.upvote = data.vote;
				$scope.voted = true;
			});
		}
		//undo vote
		$scope.undovote = function() {
			$http({
				method : 'POST',
				url : '/undovote',
				data : $.param($scope.song),
				headers : {'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data) {
				console.log(data);
				$scope.song.upvote = data.vote;
				$scope.voted = false;
			});
		}
		//transpose
		$scope.transpose = function() {
			$http({
				method: 'POST',
				url: '/view/transpose',
				//how do i change this to include other stuff?
				data : $.param({data: $scope.songdata, step: $scope.steps, sf: $scope.sf}),
				headers : {'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data) {
				// is this the html shown?
				$scope.transposed = $scope.transposed + $scope.steps;
				$scope.song.result = data;
			});
		}
	}]);

// Song page (edit) controller
enchordControllers.controller('SongEditController', [
	'$scope', 
	'$routeParams', 
	'$http', 
	'$window',
	'$location',
	'$sce',
	'Side',
	function($scope, $routeParams, $http, $window, $location, $sce, Side){ 
		$scope.isNew = true;
		$scope.hasError = false;
		$scope.inSave = false;
		$scope.song = {};
		$scope.message = '';
		$scope.reverseParseMode = false;
  		var win = $window;
  		var unWatch = $scope.$watch('songEditForm.$dirty || markupForm.$dirty', function(value) {
    		if(value) {
      			win.onbeforeunload = function(){
        			return 'You have unsaved changes.';
      			};
    		} else {
    			win.onbeforeunload = function(){};
    		}
  		});

		$scope.parsehtml = function() {
			$http({
				method  : 'POST',
				url     : '/parsesonghtml',
				data    : $.param($scope.song),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data) {
				console.log(data);
				$scope.song.result = data;
				$scope.message = data.message;
			});
		}

		// Guarantee that returned html is clean
		$scope.parsedResult = function() {
			return $sce.trustAsHtml($scope.song.result);
		}

		// $scope.init = function() {
		// 	var _id = $routeParams._id;
		$scope.init = function(_id) {
			// if(_id == undefined)
			// 	Side.setPagetype("createsong");
			// else
			// 	Side.setPagetype("editsong");
			if(_id != undefined && _id.length != 0) {
				var getUrl = '/findsong/' + _id;
				$http({
					method  : 'GET',
					url     : getUrl
				}).success(function(data) {
					console.log(data);
					if (data.song == undefined) { // if song does not exist
						console.log("Song not found");
						$window.location.href='/members/createsong';
						return;
					}
					$scope.song = data.song;
					$scope.isNew = false;
					$scope.parsehtml();
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
				$scope.parsehtml();
			}
			console.log($scope.isNew);
		}

		$scope.createsong = function() {
			console.log(unWatch);
			unWatch();
			win.onbeforeunload = function(){};
			console.log("create " + $scope.song.title);
			console.log($('#data').val());
			console.log($scope.song);
			$scope.song.data = $('#data').val();
			$scope.song = cleanSong($scope.song);
			console.log($scope.song);
			$http({
				method  : 'POST',
				url     : '/createsong',
				data    : $.param($scope.song),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data){
				console.log(data);
				
				// go to edit page
				$scope.isNew = false;
				// console.log($scope.inSave);
				$window.location.href='/members/editsong/' + data.song._id;
				// $location.url(url);

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
		$scope.editsong = function(redirect) {
			// $scope.inSave = true;
			console.log("edit " + $scope.song.title);
			$scope.song.data = $('#data').val();
			$scope.song = cleanSong($scope.song);
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
				$scope.markupForm.$setPristine();
				if(redirect)
					$window.location.href = '/viewsong/'.concat($scope.song._id);
			}).error(function(data, status) {
				console.log(data);
				console.log(status);
				if (status == 500) {
					console.log(status);
					$scope.message = data.message;
					$scope.hasError = data.hasError;
				}
			});
			// $scope.inSave = false;
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
		//transpose
		$scope.transpose = function() {
			$http({
				method: 'POST',
				url: '/edit/transpose',
				//how do i change this to include other stuff?
				data : $.param({songid: $scope.song.id, data: $scope.songdata, step: $scope.steps, sf: $scope.sf}),
				headers : {'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data) {
				// is this the html shown?
				$scope.transposed = $scope.transposed + $scope.steps;
				$scope.markupForm = data;
			});
		}

		$scope.enterReverseParseMode = function() {
			$scope.reverseParseMode = true;
		}

		$scope.reverseParse = function() {
			$scope.reverseParseMode = false;
		}
	}]);

// Artist controller
enchordControllers.controller('ArtistController', [
	'$scope', 
	'$routeParams', 
	'$http', 
	'$window',
	'$location',
	'$sce',
	'Side',
	function($scope, $routeParams, $http, $window, $location, $sce, Side) { 
		$scope.currentPage = 0;
		$scope.pageSizes = [10, 25, 50];
		$scope.pageSize = 10;
		$scope.artistsongs = [];
		$scope.init = function(artistname) {
			$scope.name = artistname;
			console.log('hello world');
			if (artistname != undefined && artistname.length > 0) {
				console.log('hello world2');
				var url = '/artistpage/' + artistname;
				$http({
					method : 'GET',
					url    : url
				}).success(function(data) {
					console.log(data);
					$scope.artistsongs = data.results;
				});
			}
		}
		$scope.numberOfPages = function() {
			if ($scope.artistsongs.length == 0)
				return 1;
			return Math.ceil($scope.artistsongs.length/$scope.pageSize);
		}
		$scope.setPredicate = function(predicate) {
			$scope.predicate = predicate;
			$scope.reverse = !$scope.reverse;
		}
	}]);

// enchordControllers.controller('ArtistController', ['$scope',
// 	'$scope', 
// 	'$http', 
// 	function($scope, $http) {
// 		$scope.init = function(query) {
// 			$scope.query = query;
// 			console.log('hello world');
// 			if (query != undefined && query.length > 0) {
// 				$http({
// 					method : 'GET',
// 					url    : '/artistpage/' + query
// 				}).success(function(data) {
// 					$scope.artistsongs = data.results;
// 				});
// 			}
// 		}
// 	}]);

// Signup controller
enchordControllers.controller('SignupController', ['$scope',
	function($scope){
		$scope.passMatch = true;
		// check that passwords match
		$scope.checkPass = function() {
			$scope.passMatch = $scope.signupForm.password.$viewValue == $scope.signupForm.password_repeat.$viewValue;
		}
	}]);

// Reset Password controller
enchordControllers.controller('ResetPasswordController', ['$scope',
	function($scope){
		$scope.passMatch = true;
		// check that passwords match
		$scope.checkPass = function() {
			$scope.passMatch = $scope.resetForm.password.$viewValue == $scope.resetForm.password_repeat.$viewValue;
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
	}]);

enchordControllers.controller('BandController', [
	'$scope', 
	'$http', 
	'$window',
	'$location',
	'Side',
	function($scope, $http, $location, Side) {
		$scope.user = {}
		$scope.band = {}
		$scope.init = function() {
			Side.setPagetype('band');
			// $http({
			// 	method : 'GET',
			// 	url    : '/search',
			// 	params : { query : $scope.query }
			// }).success(function(data) {
			// 	console.log(data);
			// 	$scope.globalresults = data.results.global;
			// 	$scope.localresults = data.results.local;
			// });// console.log(docs);
			callback(docs);
			return;
			$http({
				method : 'GET',
				url    : '/getuserinfo'
			}).success(function(data) {
				console.log(data);
				if (data.id == undefined) {
					$location.url('/');
					return
				}
				$scope.user.username = data.username;
				$scope.user.id = data.id;
			});
			if ($routeParams._id != undefined) {
				$http({
					method : 'GET',
					url    : '/findband/' + $scope.band._id
				}).success(function(data){
					console.log(data);
					$scope.band = data.band;
				});
			}
		}
		$scope.createband = function() {
			console.log($scope.band);
			$http({
				method: 'POST',
				url : '/createband/',
				data    : $.param({bandname: $scope.band.name}),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data) {
				console.log(data);
				$window.location.href='/members';
			})
			/*$http({
				method : 'POST',
				url    : '/members/createband',
				params : {bandname : $scope.band.name}
			}).success(function(data){
				console.log(data);
				$location.url('/members/editband/' + data.band._id);
			})*/
		}
		$scope.editband = function() {
			$http({
				method : 'POST',
				url    : '/editband',
				params : {band : $scope.band}
			}).success(function(data){
				console.log(data);
			})
		}
		$scope.addmember = function(username) {
			$http({
				method : 'POST',
				url    : '/addmember',
				params : {bandid : $scope.band._id, username : username}
			}).success(function(data){
				console.log(data);
				if (!data.success) {
				} else {
					$http({
						method : 'GET',
						url    : '/findband/' + $scope.band._id
					}).success(function(data){
						console.log(data);
						$scope.band = data.band;
					});
				}
			});
		}
		$scope.deletemember = function(userid) {
			$http({
				method : 'POST',
				url    : '/deletemember',
				params : {bandid : $scope.band._id, userid : userid}
			}).success(function(data){
				console.log(data);
				if (!data.success) {
				} else {
					$http({
						method : 'GET',
						url    : '/findband/' + $scope.band._id
					}).success(function(data){
						console.log(data);
						$scope.band = data.band;
					});
				}
			});
		}
	}]);
enchordControllers.controller('BandViewController', [
	'$scope', 
	'$http', 
	'$location',
	'Side',
	function($scope, $http, $location, Side) {
		$scope.user = {}
		$scope.band = {}
		$scope.init = function() {
			Side.setPagetype('viewband');
			// $http({
			// 	method : 'GET',
			// 	url    : '/search',
			// 	params : { query : $scope.query }
			// }).success(function(data) {
			// 	console.log(data);
			// 	$scope.globalresults = data.results.global;
			// 	$scope.localresults = data.results.local;
			// });
			// $http({
			// 	method : 'GET',
			// 	url    : '/getuserinfo'
			// }).success(function(data) {
			// 	console.log(data);
			// 	if (data.id == undefined) {
			// 		$location.url('/');
			// 		return
			// 	}
			// 	$scope.user.username = data.username;
			// 	$scope.user.id = data.id;
			// });
			// if ($routeParams._id != undefined) {
			// 	$http({
			// 		method : 'GET',
			// 		url    : '/findband/' + $scope.band._id
			// 	}).success(function(data){
			// 		console.log(data);
			// 		$scope.band = data.band;
			// 	});
			// }
			// TEMP
			$http({
				method  : 'GET',
				url     : '/mysongs'
			}).success(function(data) {
				console.log(data);
				$scope.usersongs = data.usersongs;
				$scope.pagetype = "search";
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
enchordControllers.controller('FolderController', [
	'$scope', 
	'$routeParams', 
	'$http', 
	'$window',
	'$location',
	'$sce',
	'Side',
	function($scope, $routeParams, $http, $window, $location, $sce, Side) {
		$scope.folder = {};
		$scope.userfolders = [];
		$scope.songid = '';
		$scope.init = function() {
			$scope.songid = songid;
			$http({
				method  : 'GET',
				url     : '/myfolders'
			}).success(function(data) {
				console.log(data);
				$scope.userfolders = data.userfolders;
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

		$scope.createfolder = function() {
			console.log("create " + $scope.folder.name);
			$http({
				method : 'GET',
				url    : '/createfolder/' + $scope.folder.name
			}).success(function(data){
				console.log(data);
				$window.location.href='/members/editfolder/' + data.folder._id;
			});
		}
		$scope.addToFolder = function(folderid) {
			console.log("add to folder" + folderid);
			$http({
				method: 'POST',
				url : '/addsongtofolder',
				data    : $.param({songid: $scope.songid, folderid: folderid}),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data) {
				console.log(data);
				$window.location.href='/members';
			});
		}


	}]);
enchordControllers.controller('FolderViewController', [
	'$scope',
	'$http',
	'$window',
	'$routeParams',
	'$sce',
	function($scope, $http, $window, $routeParams, $sce){
		$scope.folder = {};
		$scope.usersongs = [];
		$scope.query="";
		$scope.folderid = "";
		$scope.addSongMode = false;
		$scope.init = function(_id) {
			$scope.folderid = _id;
			$http({
				method  : 'GET',
				url     : '/mysongs'
			}).success(function(data) {
				console.log(data);
				$scope.usersongs = data.usersongs;
			}).error(function(data, status) {
				console.log(data);
				console.log(status);
				if (status == 500) {
					console.log(status);
					$scope.message = data.message;
					$scope.hasError = data.hasError;
				}
			});
			if(_id != undefined && _id.length != 0) {
				var getUrl = '/viewfoldersongs/' + _id;
				$http({
					method : 'GET',
					url : getUrl
				}).success(function(data) {
					console.log(data);
					$scope.folder = data.folder;
				});
			}
		}
		$scope.deletesong = function(songid) {
			console.log(songid);
		}

		$scope.renamefolder = function() {
			$http({
				method : 'POST',
				url : '/renamefolder',
				data : $.param({folderid: $scope.folderid, name: $scope.folder.name}),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data) {
				console.log(data);
				if (data.success)
					console.log("success");
			});
		}
		$scope.deletefolder = function() {
			$http({
				method : 'POST',
				url : '/deletefolder',
				data : $.param({folderid: $scope.folderid}),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function(data) {
				console.log(data);
				if (data.success)
				$window.location.href="/members";
			});
		}

		$scope.enterEditMode = function() {
			$scope.editFolderMode = true;
		}

		$scope.enterAddSongMode = function() {
			// console.log("here");
			$scope.addSongMode = true;
		}
		$scope.leaveAddSongMode = function() {
			// console.log("here");
			$scope.addSongMode = false;
		}
}]);
enchordControllers.controller('AdvancedSearchController', [
	'$scope', 
	'$window', 
	'$routeParams', 
	'$location', 
	'$http',
	'Side',
	function($scope, $window, $routeParams, $location, $http, Side) {
		$scope.query = "";
		$scope.globalresults = [];
		$scope.localresults = [];
		$scope.init = function(query) {
			Side.setPagetype('search');
			$scope.query = query;
			if (query != undefined && query.length > 0) {
				$http({
					method : 'GET',
					url    : '/advsearch',
					params : { query : $scope.query }
				}).success(function(data) {
					console.log(data);
					$scope.globalresults = data.results.global;
					$scope.localresults = data.results.local;
				});
			}
		}
		// redirect to search page
		$scope.search = function() {
			console.log($scope.query);
			if ($scope.query != undefined && $scope.query.length > 0) {
				$window.location.href = '/advsearch/' + $scope.query;
			}
		};
	}]);
/* OLD CODE */
/* front-end parser */
// $scope.parse = function() {
// 	//readLines($scope.song.data, function(data){$scope.song.result = data});
// 	console.log($scope.song.data);
// 	$http({
// 		method  : 'GET',
// 		url     : '/parsesong',
// 		params  : { data : $scope.song.data }
// 		//headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
// 	}).success(function(data) {
// 		console.log(data);
// 		$scope.song.result = data + " parsed";
// 	});
// 	$http({
// 		method  : 'POST',
// 		url     : '/parsesong',
// 		data    : $.param($scope.song),
// 		headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
// 	}).success(function(data) {
// 		console.log(data);
// 		$scope.song.result = data + " parsed";
// 	});
// }
/* profile controller */
// enchordControllers.controller('ProfileController', ['$scope', '$http',
// 	function($scope, $http){
// 		$scope.usersongs = {};
// 		$scope.init = function() {
// 			$http({
// 				method  : 'GET',
// 				url     : '/mysongs'
// 			}).success(function(data) {
// 				console.log(data);
// 				$scope.usersongs = data.sersongs;
// 			}).error(function(data, status) {
// 				console.log(data);
// 				console.log(status);
// 				if (status == 500) {
// 					console.log(status);
// 					$scope.message = data.message;
// 					$scope.hasError = data.hasError;
// 				}
// 			});
// 		}
// 	}]);