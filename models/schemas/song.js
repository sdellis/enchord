var mongoose = require('mongoose');

/* all the lower case things are for searching purposes */
module.exports = mongoose.model('song', {
	title: String,
	title_lower: String,
	artist: String,
	artist_lower: String,
	author_id: String,
	author_name: String,
	author_lower: String,
	genre: String,
	genre_lower: String,
	tabbed_date: String,
	data: String,
	pub: Boolean,
	search_string: Array,
	upvote: Number,
	rates: [String],
	folder_id: String
});