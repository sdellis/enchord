var Schema = require('../schemas/user');
var passwordHash = require('password-hash');
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Enchord' });
};

exports.auth = function(req, res) {
	if (!req.isAuthenticated()) res.send(401);
	else next();
};

exports.signup = function(req, res) {
	var User = new Schema({
		user: req.body.username,
		email: req.body.email,
		password: passwordHash.generate(req.body.password)
	});
	User.save(function (err, product, numberAffected) {
		if (err) {
			console.log(err);
			res.status(500).json({status:'failure'});
			return;
		}
		console.log('success!');
	})
	res.redirect('#/');
}