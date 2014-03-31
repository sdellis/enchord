var mongoose = require('mongoose');
var passwordHash = require('password-hash');

var validatePrescenseOf = function(value) {
	return value && value.length;
}

var toLower = function(string){
	return string.toLowerCase();
}

var User = mongoose.Schema({
	user: { type: String,
		validate: [validatePrescenseOf, 'a Username is required'],
		set: toLower,
		index: {unique: true}
	},
	email: { 
		type: String,
		validate: [validatePrescenseOf, 'a Email is required'],
		set: toLower,
		index: {unique: true}
	},
	password: String
});

User.methods.generateHash = function(password) {
	return passwordHash.generate(password);
}

User.methods.validPassword = function(password) {
	return passwordHash.verify(password, this.password);
}


module.exports = mongoose.model('Users', User);