var mailer = require('../config/nodemailer');
var utils = require('./utils');
var folderutils = require('./folderutils');
var User = require('../models/schemas/user');
var songSchema = require('../models/schemas/song');
var async = require('async');

var parser = require('../parsers/parser');
var htmlparser = require('../parsers/htmlparser');
var transposer = require('../parsers/transpose');
var reverseparser = require('../parsers/reverseparser');
var songEmpty = {
		title: '',
		artist: '',
		genre: '',
		data: '',
		_id: '',
		pub: true
		};

module.exports = function(app, passport, db) {

	/* make sure db is connected before allowing user to call routes*/
	db.mongoose.once('open', function callback() {

		/* ------------------------ home page ---------------------------------- */
		app.get('/', protectLogin, function(req, res){
	 		res.render('home', { title: 'Enchord' });
		});

		/* ------------------------ login routes ---------------------------------- */

		app.get('/login', protectLogin, function(req, res){
			res.render('login', {title: "enchord", message: req.flash('loginMessage')});
		});
		app.post('/login', passport.authenticate('local-login', {
			successRedirect: '/members', 
			failureRedirect: '/login',
			failureFlash : true // allow flash messages
		}));
		app.get('/logout', function(req, res) {
			req.logout();
			res.redirect('/');
		});
		app.get('/signup', protectLogin, function(req, res){
			res.render('signup', {title: "enchord", message: req.flash('signupMessage')});
		});
		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect: '/members',
			failureRedirect: '/signup',
			failureFlash : true // allow flash messages
		}));

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

		app.get('/forgot', function(req, res) {
			res.render('forgot', {
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

		
		/*app.get('/forgot', function (req, res) {
			res.render('forgot.ejs', {title:"Members", user:req.user});
		}); */

		/* ------------------------logged in routes -------------------------------- */

		// refactor this
		app.get('/members', isLoggedIn, function(req, res) {
			utils.getMySongs(req, res, function(usersongs) {
				console.log("In routes");
				// console.log(usersongs);
				if (usersongs != undefined) {
					folderutils.getFoldersAndSongs(req, res, function(userfolders) {
						console.log(userfolders);
						res.render('index.ejs', {
						title:"Members",
						isLoggedIn: req.isAuthenticated(), 
						user: req.user, 
						username: utils.getUsername(req), 
						usersongs: usersongs, 
						userfolders: userfolders,
						message: req.flash('success')
						});
					});
				}
			});			
		});

		app.get('/members/settings', isLoggedIn, function(req, res) {
			utils.getMySongs(req, res, function(usersongs) {
				console.log("In routes");
				// console.log(usersongs);
				if (usersongs != undefined) {
					folderutils.getFoldersAndSongs(req, res, function(userfolders) {
						console.log(userfolders);
						res.render('useraccount.ejs', {
						title:"Members",
						isLoggedIn: req.isAuthenticated(), 
						user: req.user, 
						username: utils.getUsername(req), 
						usersongs: usersongs, 
						userfolders: userfolders,
						message: req.flash('success')
						});
					});
				}
			});
		});

		app.post('/changepassword', isLoggedIn, utils.changePass);


		app.post('/createsong', isLoggedIn, utils.createSong);
		
		// app.get('/editsong', isLoggedIn, function(req, res) {
		// 	res.render('editsong.ejs', {title: 'enchord', isNew: true, song: songEmpty, message: ''});
		// });
		
		app.post('/editsong', isLoggedIn, utils.editSong);
		
		app.get('/editsong/:_id', utils.isAuthor, utils.loadSongEdit);


		app.get('/members/createsong', isLoggedIn, function(req, res){
			res.render('editsong.ejs', {
				isLoggedIn: req.isAuthenticated(),
				username: utils.getUsername(req),
				_id: '',
				isNew: true
			});
		});

		app.get('/members/editsong/:_id', utils.isAuthor, function(req, res){
			res.render('editsong.ejs', {
				isLoggedIn: req.isAuthenticated(),
				username: utils.getUsername(req),
				_id: req.params._id,
				isNew: false
			});
		});

		// TODO: should check whether author of folder
		app.get('/members/editfolder/:_id', isLoggedIn, function(req, res){
			res.render('editfolder.ejs', {
				isLoggedIn: req.isAuthenticated(),
				username: utils.getUsername(req),
				_id: req.params._id
			});
		});

		app.get('/members/viewfolder/:_id', isLoggedIn, function(req, res) {
			res.render('viewfolder.ejs', {
				isLoggedIn: req.isAuthenticated(),
				username: utils.getUsername(req),
				_id: req.param._id
			});
		});

		/* ------------------------- non logged in routes ------------------------*/

		app.get('/viewsong/:_id', function(req, res){
			var isLoggedIn = req.isAuthenticated();
			var username = utils.getUsername(req);
			res.render('viewsong.ejs', {
				isLoggedIn: isLoggedIn,
				username: username,
				_id: req.params._id
			});
		});

		app.get('/searchresults/:query', function(req, res){
			res.render('results.ejs', {
				isLoggedIn: req.isAuthenticated(),
				username: utils.getUsername(req),
				query: req.params.query,
				isAdvSearch: false,
				title: "",
				artist: "",
				genre: "",
				author: ""
			});
		});

		app.get('/advsearchresults', function(req, res){
			console.log(req.query);
			res.render('results.ejs', {
				isLoggedIn: req.isAuthenticated(),
				username: utils.getUsername(req),
				query: "",
				isAdvSearch: true,
				title: req.query.title,
				artist: req.query.artist,
				genre: req.query.genre,
				author: req.query.author
			});
		});



		app.get('/isAuthor', utils.isAuthorOfSong);
		
		app.get('/search', utils.searchSong);
		
		app.get('/advsearch', utils.advancedSearch);

		app.get('/findsong/:_id', utils.getSong);
		app.get('/createsong', isLoggedIn, function(req, res) {
			res.render('editsong.ejs', {title: 'enchord', isNew: true, song: songEmpty, message: ''});
		});

		// app.get('/viewsong/:_id', utils.loadSongView);

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
			htmlparser.parseSongHTML(req.body.data, req.body.font, req.body.fontsize + "px", function(parsedSong) {
				console.log("In routes: " + parsedSong);
				res.send(parsedSong);
			});
		});

		app.post('/reverseparse', function(req, res) {
			console.log("data: " + req.body.data);
			reverseparser.reverseParser(req.body.data, function(reverseParsedSong) {
				console.log("In routes reverse parser: " + reverseParsedSong);
				res.send({markup: reverseParsedSong});
			});
		})


		app.post('/view/transpose', function(req, res) {
			console.log('im here');
			transposer.transpose(req.body.data, req.body.step, req.body.sf, 'html', function(transposedSong) {
				console.log("In routes: " + transposedSong);
				res.send(transposedSong);
			});
		});

		app.post('/edit/transpose', function(req, res) {
			console.log('edit transpose');
			transposer.transpose(req.body.data, req.body.step, req.body.sf, 'txt', function(transposedSong) {
				songSchema.findById(req.body.songid, function(err, docs) {
					if (err) {
						console.log('db error in transpose');
					} else {
						docs.data = transposedSong;
						docs.save(function(err) {
							if (err) {
								console.log('db error in transpose');
							}
						});
					}
				});
			});
		});


		/*app.get('/search', function(req, res) {
			res.render('search.ejs', {title: 'enchord', query: req.query.query, isLoggedIn: true, results: []});
		});*/
		
		/* ------------------- artist routes --------------------------- */

		app.get('/artist/:artistname', function(req, res) {
			res.render('artistpage.ejs', {
				isLoggedIn: req.isAuthenticated(),
				username: utils.getUsername(req),
				artistname: req.params.artistname,
				userfolders: []
			});
		})
		app.get('/artistpage/:query', utils.getArtistSongs);
		
		
		
		/* ---------------------- folders routes -------------------------------- */		
		//folder testing stuff
		app.get('/myfolders', isLoggedIn, folderutils.getUserFolders);
		
		app.get('/viewfoldersongs/:_id', isLoggedIn, folderutils.getFolderSongs);
		
		//app.get('/addsongtofolder/:folderid&:songid', isLoggedIn, folderutils.addSongToFolder);
		app.get('/addsongtofolder/:songid', isLoggedIn, function(req, res) {
			res.render('addtofolder.ejs', {
				songid: req.params.songid,
				isLoggedIn: req.isAuthenticated(),
				username: utils.getUsername(req)
			});
		});
		app.post('/addsongtofolder', isLoggedIn, folderutils.addSongToFolder);
		
		//check this, maybe need folderid to check????
		app.get('/deletesongfromfolder/:songid', isLoggedIn, folderutils.deleteSongFromFolder);
		
		app.get('/createfolder/:name', isLoggedIn, folderutils.makeFolder);
		
		//app.get('/sharefolder/:folderid&:userid', isLoggedIn, folderutils.shareFolder);
		
		app.post('/renamefolder', isLoggedIn, folderutils.renameFolder);
		
		app.post('/deletefolder', isLoggedIn, folderutils.deleteFolder);
		

		/* --------------------- voting routes ---------------------------- */
		//voting stuff
	    app.post('/upvote', isLoggedIn, utils.upvote);
	    app.post('/undovote', isLoggedIn, utils.undovote);
	    app.get('/hasvoted', isLoggedIn, utils.hasvoted);

		
	    // ?????
		app.get('/partials/:filename', function(req, res){
			var filename = req.params.filename;
			if(!filename) return; // todo
			res.render("partials/" + filename);
		});


		app.get('/mysongs', isLoggedIn, utils.getUserSongs);

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
