var mongoose = require('mongoose');

module.exports = mongoose.model('song', {
	title: String,
	artist: String,
	author_id: String,
	author_name: String,
	genre: String,
	tabbed_date: String,
	data: String,
	pub: Boolean
});