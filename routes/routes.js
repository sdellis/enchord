
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
