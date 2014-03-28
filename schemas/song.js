var mongoose = require('mongoose');

module.exports = mongoose.model('song', {
	title: String,
	artist: String,
	author: String,
	tabbed_date: String,
	data: String
});