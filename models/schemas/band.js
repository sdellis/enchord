var mongoose = require('mongoose');

module.exports = mongoose.model('band', {
	band_name: String,
	band_members: [String],
	leader: String
});