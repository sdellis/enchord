var mongoose = require('mongoose');

module.exports = mongoose.model('folder', {
	name: String,
	author_name: String,
	author_id: String,
	parent_folder: String //if applicable
});