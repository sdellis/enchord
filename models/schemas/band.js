var mongoose = require('mongoose');

module.exports = mongoose.model('band', {
	name: String,
	members: [{id: String, name: String}],
	leader: {id: String. name: String}
});