
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
		app.get('/signup', function(req, res){
			res.render('signup.ejs', {title: "enchord", message: req.flash('signupMessage')});
		});
		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect: '/members',
			failureRedirect: '/signup',
			failureFlash : true // allow flash messages
		}));
		app.get('/members', isLoggedIn, function(req, res) {
			res.render('profile.ejs', {title:"Members", user:req.user});
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

// Middle ware to prevent access to login page if already logged in
function protectLogin(req, res, next) {
	// console.log(req.isAuthenticated())
	if (!req.isAuthenticated())
		return next();
	res.redirect('/members');
}