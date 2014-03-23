var Schema = require('../schemas/user');
var passwordHash = require('password-hash');
var passport = require('../auth.js');
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
		passport.authenticate('local')(req, res, function () {
			res.redirect('#/');

		});	
		/*req.login(User, function(err) {
			if (err) throw err;
			res.redirect('#/');
		});  */
		
	})
	//passport.authenticate('local', { successRedirect: '#/', failureReirect: '#/login'})

	//res.redirect('#/');
}

/*exports.logout = function(req, res) {
	req.session.destroy(function(){
		res.reirect('#/');
	});
}*/