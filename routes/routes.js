var mailer = require('../config/nodemailer');
var utils = require('./utils');
var folderutils = require('./folderutils');
var User = require('../models/schemas/user');
var async = require('async');

var parser = require('../parser');
var htmlparser = require('../htmlparser')
var songEmpty = {
		title: '',
		artist: '',
		genre: '',
		data: '',
		_id: '',
		pub: true
		};

module.exports = function(app, passport, db) {

	db.mongoose.once('open', function callback() {
		app.get('/', protectLogin, function(req, res){
	 		res.render('index', { title: 'Enchord' });
		});

		// app.get('/home', function(req, res){
		// 	res.render('home.ejs');
		// })
		
		app.get('/about', function(req, res){
			res.render('about.ejs', {title:"enchord"});
		});

		app.get('/login', protectLogin, function(req, res){
			res.render('login.ejs', {title: "enchord", message: req.flash('loginMessage')});
		});
		app.post('/login', passport.authenticate('local-login', {
			successRedirect: '/members', 
			failureRedirect: '/login',
			failureFlash : true // allow flash messages
		}));
		app.get('/signup', protectLogin, function(req, res){
			res.render('signup.ejs', {title: "enchord", message: req.flash('signupMessage')});
		});
		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect: '/members',
			failureRedirect: '/signup',
			failureFlash : true // allow flash messages
		}));

		app.get('/forgot', function(req, res) {
			res.render('forgot.ejs', {
				title: 'enchord',
				user: req.user,
				messageerror: req.flash('error'),
				messageinfo: req.flash('info')
			});
		});

		app.post('/forgot', mailer.sendmail);

		app.get('/reset/:token', function(req, res) {
			User.findOne({'local.resetPasswordToken': req.params.token}, function(err, user) {
				console.log(user);
				console.log(req.params.token);
				if (err)
					done(err);
				if (!user) {
					req.flash('messageerror', 'Password reset token is invalid or has expired.');
					return res.redirect('/forgot');
				} else {
					if (user.local.resetPasswordExpires < Date.now()) {
						console.log('confirm');
						req.flash('messageerror', 'Password reset token is invalid or has expired.');
						return res.redirect('/forgot');
					}
				}
				res.render('reset.ejs', {
					title: 'enchord',
					user: req.user,
					tokens: req.params.token
				});
			});
		});

		app.post('/reset/:token', mailer.confirm);

		// refactor this
		app.get('/members', isLoggedIn, function(req, res) {
			utils.getMySongs(req, res, function(usersongs) {
				console.log("In routes");
				console.log(usersongs);
				if (usersongs != undefined) {
					res.render('profile.ejs', {title:"Members", user:req.user, username: utils.getUsername(req), usersongs: usersongs, message: req.flash('success')});
				}
			});			
		});

		app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

		app.get('/auth/facebook/callback', passport.authenticate('facebook', {
			successRedirect : '/members',
			failureRedirect : '/login'
		}));

		app.get('/auth/twitter', passport.authenticate('twitter'));

		app.get('/auth/twitter/callback', passport.authenticate('twitter', {
			successRedirect : '/members',
			failureRedirect : '/login'
		}));

		app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

		app.get('/auth/google/callback', passport.authenticate('google', {
			successRedirect : '/members',
			failureRedirect : '/login'
        }));
		
		app.get('/findsong/:_id', utils.getSong)
		app.get('/createsong', isLoggedIn, function(req, res) {
			res.render('editsong.ejs', {title: 'enchord', isNew: true, song: songEmpty, message: ''});
		});

		app.post('/createsong', isLoggedIn, utils.createSong);
		
		// app.get('/editsong', isLoggedIn, function(req, res) {
		// 	res.render('editsong.ejs', {title: 'enchord', isNew: true, song: songEmpty, message: ''});
		// });
		
		app.post('/editsong', isLoggedIn, utils.editSong);
		
		app.get('/editsong/:_id', utils.isAuthor, utils.loadSongEdit);

		app.get('/viewsong/:_id', utils.loadSongView);

		app.get('/downloadsongtxt/:_id', utils.downloadSongTxt);

		// app.get('/downloadsongpdf/:_id', utils.downloadSongPdf);
		// app.get('/handler', utils.downloadSongPdfHandler);
		
		app.post('/deletesong', isLoggedIn, utils.deleteSong);
		
		app.post('/parsesong', isLoggedIn, function(req, res) {
			parser.parseSong(req.body.data, function(parsedSong) {
				console.log("In routes: " + parsedSong);
				res.send(parsedSong);
			});
		});

		app.post('/parsesonghtml', function(req, res) {
			console.log(req.body);
			htmlparser.parseSongHTML(req.body.data, "Courier", "12px", function(parsedSong) {
				console.log("In routes: " + parsedSong);
				res.send(parsedSong);
			});
		});

		/*app.get('/search', function(req, res) {
			res.render('search.ejs', {title: 'enchord', query: req.query.query, isLoggedIn: true, results: []});
		});*/
		
		app.get('/search', utils.searchSong);
		
		app.get('/advsearch', utils.advancedSearch);
		
		app.get('/artist/:query', utils.getArtistSongs);
		
		// app.get('/mysongs', isLoggedIn, utils.getMySongs);
		
		//folder testing stuff
		app.get('/myfolders', isLoggedIn, folderutils.getUserFolders);
		
		app.get('/viewfoldersongs/:_id', isLoggedIn, folderutils.getFolderSongs);
		
		app.get('/makefolder/:name', isLoggedIn, folderutils.makeFolder);
		
		app.get('/sharefolder/:folderid&:userid', isLoggedIn, folderutils.shareFolder);
		
		//no longer works properly(because of folders) DO NOT USE
		app.get('/remakeDB', utils.remakeDB);
		
		/*
        //authorize when already logged in
        app.get('/connect/local', function(req, res) {
        	res.render('connect-local.ejs', {message: req.flash('loginMessage')});
        });

        app.post('/connect/local', passport.authenticate('local-signup', {
			successRedirect : '/members',
			failureRedirect : '/connect/local',
			failureFlash : true // allow flash messages
		}));

		app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

		app.get('/connect/facebook/callback', passport.authorize('facebook', {
			successRedirect : '/members',
			failureRedirect : '/login'
		}));

		app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

		app.get('/connect/twitter/callback', passport.authorize('twitter', {
			successRedirect : '/members',
			failureRedirect : '/login'
		}));

		app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

		app.get('/connect/google/callback', passport.authorize('google', {
			successRedirect : '/members',
			failureRedirect : '/login'
		}));

		//copied from scotch.io
		// local -----------------------------------
	    app.get('/unlink/local', function(req, res) {
	        var user            = req.user;
	        user.local.email    = undefined;
	        user.local.password = undefined;
	        user.save(function(err) {
	            res.redirect('/members');
	        });
	    });

	    // facebook -------------------------------
	    app.get('/unlink/facebook', function(req, res) {
	        var user            = req.user;
	        user.facebook.token = undefined;
	        user.save(function(err) {
	            res.redirect('/members');
	        });
	    });

	    // twitter --------------------------------
	    app.get('/unlink/twitter', function(req, res) {
	        var user           = req.user;
	        user.twitter.token = undefined;
	        user.save(function(err) {
	           res.redirect('/members');
	        });
	    });

	    // google ---------------------------------
	    app.get('/unlink/google', function(req, res) {
	        var user          = req.user;
	        user.google.token = undefined;
	        user.save(function(err) {
	           res.redirect('/members');
	        });
	    });
	    //copied from scotch.io */

		app.get('/logout', function(req, res) {
			req.logout();
			res.redirect('/');
		});
		app.get('/forgot', function (req, res) {
			res.render('forgot.ejs', {title:"Members", user:req.user});
		});
// 		app.post('/forgot', function (req, res) {
//     var email = req.body.email;
//     var reset = forgot(email, function (err) {
//         if (err) res.end('Error sending message: ' + err)
//         else res.end('Check your inbox for a password reset message.')
//     });

//     reset.on('request', function (req_, res_) {
//         req_.session.reset = { email : email, id : reset.id };
//         fs.createReadStream(__dirname + '/forgot.html').pipe(res_);
//     });
// });

// app.post('/reset', function (req, res) {
//     if (!req.session.reset) return res.end('reset token not set');

//     var password = req.body.password;
//     var confirm = req.body.confirm;
//     if (password !== confirm) return res.end('passwords do not match');

//     // update the user db here

//     forgot.expire(req.session.reset.id);
//     delete req.session.reset;
//     res.end('password reset');
// });
	});
}


// Middleware to verify if logged in
function isLoggedIn(req, res, next){
	if (req.isAuthenticated())
		return next();
	res.redirect('/login');
}

// Middleware to protect login page
function protectLogin(req, res, next) {
	if (!req.isAuthenticated())
		return next();
	res.redirect('/members');
}
