
module.exports = function(app, passport, db) {

	db.mongoose.once('open', function callback() {
		app.get('/', function(req, res){
	 		res.render('index', { title: 'Enchord' });
		});
		
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
		app.get('/members', isLoggedIn, function(req, res) {
			res.render('profile.ejs', {title:"Members", user: req.user});
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
	});
}


// Middleware to verify if logged in
function isLoggedIn(req, res, next){
	if (req.isAuthenticated())
		return next();
	res.redirect('/login');
}

function protectLogin(req, res, next) {
	if (!req.isAuthenticated())
		return next();
	res.redirect('/members');
}
