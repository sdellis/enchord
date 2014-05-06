/* this file has all the necessary code to send emails to reset password and confirm when
	the email has been changed */
	
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
var User = require('../models/schemas/user');

/* This function sends the reset email message to the given email */
exports.sendmail = function(req, res) {
	async.waterfall([
		function(done) {
			crypto.randomBytes(20, function(err, buf) {
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		function (token, done) {
			User.findOne({ 'local.email':req.body.email}, function(err, user) {
				if (err)
					done(err);
				if (!user) {
					req.flash('error', 'No account with that email address.');
					return res.redirect('/forgot');
				}

				user.local.resetPasswordToken = token;
				user.local.resetPasswordExpires = Date.now() + 3600000;

				user.save(function(err) {
					done(err, token, user);
				});
			});
		},
		function(token, user, done) {
			console.log('send');
			var smtpTransport = nodemailer.createTransport('SMTP', {
				service: 'Gmail',
				auth: {
					user: "jemah.enchord@gmail.com",
					pass: "enchord2016"
				}
			});
			console.log('mail options');
			var mailOptions = {
				to: user.local.email,
				from: 'jemah.enchord@gmail.com',
				subject: 'enchord password reset',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
  					  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
  					  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
  					  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			console.log('send mail');
			smtpTransport.sendMail(mailOptions, function(err) {
				if (err)
					console.log("can't send email");
				req.flash('info', 'An email has been sent to ' + user.email + ' with further instructions.');
				console.log('success');
				done(err, 'done');
			});

		}
	], function(err) {
		console.log(err);
		if (err)
			return next(err);
		res.redirect('/forgot');
	});
}

/* this function sends a confirmation email when a user has reset their password */
exports.confirm = function(req, res) {
	console.log(req.body);
	console.log(req.params.token);
	async.waterfall([
		function(done) {
			User.findOne({ 'local.resetPasswordToken': req.params.token}, function(err, user) {
				console.log(user);
				if (err)
					done(err);
				if (!user) {
					console.log('no user found');
					req.flash('messageerror', 'password reset token is invalid or has expired.');
					return res.redirect('back');
				} else {
					console.log('user found');
					if (user.local.resetPasswordExpires < Date.now()) {
						console.log('here?');
						req.flash('messageerror', 'password reset token is invalid or has expired.');
						return res.redirect('back');
					}
					user.local.password = user.generateHash(req.body.password);
					user.local.resetPasswordToken = undefined;
					user.local.resetPasswordExpires = undefined;

					console.log(user);

					user.save(function(err) {
						req.logIn(user, function(err) {
							done(err, user);
						});
					});

				}

				
			});
		},
		function(user, done) {
			var smtpTransport = nodemailer.createTransport('SMTP', {
				service: 'Gmail',
				auth: {
					user: "jemah.enchord@gmail.com",
					pass: "enchord2016"
				}
			});
			var mailOptions = {
				to: user.local.email,
				from: 'jemah.enchord@gmail.com',
				subject: 'Your password has been changed',
				text: 'Hello,\n\n' +
  					  'This is a confirmation that the password for your account ' + user.local.email + ' has just been changed.\n'
				};
				smtpTransport.sendMail(mailOptions, function(err) {
				req.flash('messageerror', 'Success! Your password has been changed.');
				done(err);
			});
		}
	], function(err) {
		res.redirect('/members');
	});
}
