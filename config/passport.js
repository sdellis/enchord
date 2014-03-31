var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/schemas/user');

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user){
			done(err, user);
		})
	});

	passport.use('local-signup', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true

	}, 
	function(req, username, password, done) {
		//because asynchronous
		process.nextTick(function() {
			User.findOne({ 'user' : username }, function(err, user) {
				if (err)
					return done(err);
				if (user) {
					console.log('user exists');
					return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
				} else {
					User.findOne({ 'email': req.body.email}, function(err, user) {
						if (err)
							return done(err);
						if (user) {
							console.log('email exists');
							return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
						} else {
							var newUser = new User();
							newUser.user = username;
							newUser.email = req.body.email;
							newUser.password = newUser.generateHash('' + password);
							newUser.save(function(err) {
								if (err)
									throw err;
								return done(null, newUser);
							});
						}
					});
				}
			});
		});
	}));

	passport.use('local-login', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, username, password, done) {
		User.findOne({ user: username }, function(err, user) {
			if (err) 
				return done(err);
			if (!user)
				return done(null, false, req.flash('loginMessage', 'Invalid username and password pair.'));
			if (!user.validPassword(password))
				return done(null, false, req.flash('loginMessage', 'Invalid username and password pair.'));
			return done(null, user);			
		});
	}));
}
