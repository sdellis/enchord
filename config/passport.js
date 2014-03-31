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
		console.log(username);
		console.log(req.body.email);
		//because asynchronous
		process.nextTick(function() {
			User.findOne({ 'local.user' : username }, function(err, user) {
				console.log(user);
				if (err)
					return done(err, req.flash('signupMessage', 'Unknown server error'));
				if (user) {
					console.log('user exists');
					return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
				} else {
					console.log('here');
					User.findOne({ 'local.email': req.body.email}, function(err, user) {
						console.log(user);
						if (err)
							return done(err);
						if (user) {
							console.log('email exists');
							return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
						} else {
							console.log(username);
							console.log(req.body.email);
							var newUser = new User();
							newUser.local.user = username;
							newUser.local.email = req.body.email;
							newUser.local.password = newUser.generateHash('' + password);
							console.log(newUser);
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
		if (isRFC822ValidEmail(username)) {
			User.findOne({ 'local.email' : username }, function(err, user) {
			
				if (err) 
					return done(err);
				if (!user){
					console.log('no user');
					return done(null, false, req.flash('loginMessage', 'Invalid username and password pair.'));
				}
				if (!user.validPassword(password)) {
					console.log('no password');
					return done(null, false, req.flash('loginMessage', 'Invalid username and password pair.'));
				}
				return done(null, user);			
			});
		} else {
			User.findOne({ 'local.user' : username }, function(err, user) {
				
				if (err) 
					return done(err);
				if (!user){
					console.log('no user');
					return done(null, false, req.flash('loginMessage', 'Invalid username and password pair.'));
				}
				if (!user.validPassword(password)) {
					console.log('no password');
					return done(null, false, req.flash('loginMessage', 'Invalid username and password pair.'));
				}
				return done(null, user);			
			});	
		}
		/* User.findOne({ field : username }, function(err, user) {
			
			if (err) 
				return done(err);
			if (!user){
				console.log('no user');
				return done(null, false, req.flash('loginMessage', 'Invalid username and password pair.'));
			}
			if (!user.validPassword(password)) {
				console.log('no password');
				return done(null, false, req.flash('loginMessage', 'Invalid username and password pair.'));
			}
			return done(null, user);			
		});*/
	}));

	passport.use(new FacebookStrategy({
		clientID: configAuth.facebookAuth.clientID,
		clientSecret: configAuth.facebookAuth.clientSecret,
		callbackURL: configAuth.facebookAuth.callbackURL,
		passReqToCallback: true
	},
	function(req, token, refreshToken, profile, done) {
		//for asynch
		if (!req.user) {
			process.nextTick(function() {
				User.findOne({'facebook.id': profile.id}, function(err, user) {
					if (err)
						return done(err);
					if (user) {
						if (!user.facebook.token) {
							user.facebook.token = token;
							user.save(function(err) {
								if (err)
									throw err;
								return done(null, user);
							})
						}
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
		} else {
			var user = req.user;

			user.facebook.id = profile.id;
			user.facebook.token = token;
			user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
	        user.facebook.email = profile.emails[0].value;

	        user.save(function(err) {
	        	if (err) 
	        		throw err;
	        	return done(null, user);
	        });
		}
	}));

	passport.use(new TwitterStrategy({
		consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL,
        passReqToCallback: true
    },
    function(req, token, tokenSecret, profile, done) {
    	if (!req.user) {
	    	process.nextTick(function() {
	    		User.findOne({ 'twitter.id': profile.id}, function(err, user) {
	    			if (err)
	    				return done(err);
	    			if (user) {
	    				if (!user.twitter.token) {
	    					user.twitter.token = token;
	    					user.save(function(err) {
	    						if (err)
	    							throw err;
	    						return done(null, user);
	    					});
	    				}
	    				return done(null, user);
	    			} else {
	    				var newUser = new User();

	    				newUser.twitter.id = profile.id;
		                newUser.twitter.token = token;
		                newUser.twitter.username = profile.username;
		                newUser.twitter.displayName = profile.displayName;

		                newUser.save(function(err) {
		                	if (err)
		                		throw err;
		                	return done(null, newUser);
		                });
	    			}
	    		});
	    	});
	    } else {
	    	var user = req.user;
			user.twitter.id = profile.id;
		    user.twitter.token = token;
	        user.twitter.username = profile.username;
            user.twitter.displayName = profile.displayName;

	        user.save(function(err) {
	        	if (err) 
	        		throw err;
	        	return done(null, user);
	        });
	    }
    }));
    passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
        passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done) {
    	if (!req.user) {
			// make the code asynchronous
			process.nextTick(function() {
		        User.findOne({ 'google.id' : profile.id }, function(err, user) {
		            if (err)
		                return done(err);

		            if (user) {
		            	if (!user.google.token) {
		            		user.google.token = token;
		            		user.save(function(err) {
		            			if (err) 
		            				throw err;
		            			return done(null, user);
		            		});
		            	}
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
		} else {
			var user = req.user;
            user.google.id = profile.id;
            user.google.token = token;
            user.google.name  = profile.displayName;
            user.google.email = profile.emails[0].value; // pull the first 
		    user.save(function(err) {
				if (err)
					throw err;
				return done(null, newUser);
			});
		}

    }));
}

function isRFC822ValidEmail(sEmail) {
  var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
  var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
  var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
  var sQuotedPair = '\\x5c[\\x00-\\x7f]';
  var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
  var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
  var sDomain_ref = sAtom;
  var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
  var sWord = '(' + sAtom + '|' + sQuotedString + ')';
  var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
  var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
  var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
  var sValidEmail = '^' + sAddrSpec + '$'; // as whole string
  
  var reValidEmail = new RegExp(sValidEmail);
  
  if (reValidEmail.test(sEmail)) {
    return true;
  }
  
  return false;
}