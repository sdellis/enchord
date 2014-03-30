var passport = require('passport');
var LocalStrategy = require('passport-local');
var Schema = require('./schemas/user');
var passwordHash = require('password-hash');

passport.use('local-login', new LocalStrategy( //{passReqToCallback: true},
	function(username, password, done) {
		Schema.findOne({ user: username }, function(err, user) {
			if (err) {
				return done(err);
			}
			if (passwordHash.verify(password, user.password)) {
				return done(null, {username: user});
			} else {
				return done(null, false, {message: 'Incorrect username and password pair.'});
			}
		});
	}
));

// add local-signup strategy

passport.serializeUser(function(user, done) {
	done(null, user.username);
});

passport.deserializeUser(function(username, done) {
	done(null, {username: username});
});

module.exports = passport;