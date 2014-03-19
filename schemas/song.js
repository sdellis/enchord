var mongoose = require('mongoose');

module.exports = mongoose.model('song', {
	title: String,
	author: String,
	tabbed_by: String,
	tabbed_date: String,
	key: String,
	data: String
});