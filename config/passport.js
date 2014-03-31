var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require('../models/schemas/user');
var configAuth = require('./auth');

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
							newUser.local.user = username;
							newUser.local.email = req.body.email;
							newUser.local.password = newUser.generateHash('' + password);
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

	passport.use(new FacebookStrategy({
		clientID: configAuth.facebookAuth.clientID,
		clientSecret: configAuth.facebookAuth.clientSecret,
		callbackURL: configAuth.facebookAuth.callbackURL
	},
	function(token, refreshToken, profile, done){
		//for asynch
		process.nextTick(function() {
			User.findOne({'facebook.id': profile.id}, function(err, user) {
				if (err)
					return done(err);
				if (user) {
					return done(null, user);
				} else {
					var newUser = new User();

					newUser.facebook.id = profile.id;
					newUser.facebook.token = token;
					newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
					newUser.facebook.email = profile.emails[0].value;

					newUser.save(function(err) {
						if (err)
							throw err;
						return done(null, newUser);
					});
				}
			});
		});
	}));

	passport.use(new TwitterStrategy({
		consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL
    },
    function(token, tokenSecret, profile, done) {
    	process.nextTick(function() {
    		User.findOne({ 'twitter.id': profile.id}, function(err, user) {
    			if (err)
    				return done(err);
    			if (user) {
    				return done(null, user);
    			} else {
    				var newUser = new User();

    				newUser.twitter.id          = profile.id;
	                newUser.twitter.token       = token;
	                newUser.twitter.username    = profile.username;
	                newUser.twitter.displayName = profile.displayName;

	                newUser.save(function(err) {
	                	if (err)
	                		throw err;
	                	return done(null, newUser);
	                });
    			}
    		});
    	});
    }));
    passport.use(new GoogleStrategy({
        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
    },
    function(token, refreshToken, profile, done) {

		// make the code asynchronous
		process.nextTick(function() {
	        User.findOne({ 'google.id' : profile.id }, function(err, user) {
	            if (err)
	                return done(err);

	            if (user) {
	                return done(null, user);
	            } else {
	                var newUser          = new User();
	                newUser.google.id    = profile.id;
	                newUser.google.token = token;
	                newUser.google.name  = profile.displayName;
	                newUser.google.email = profile.emails[0].value; // pull the first email

	                newUser.save(function(err) {
	                    if (err)
	                        throw err;
	                    return done(null, newUser);
	                });
	            }
	        });
	    });

    }));
}
