var mongoose = require('mongoose');

module.exports = mongoose.model('folder', {
	name: String,
	author_name: String, //original creator of the folder(can be changed to array)
	//shared: [String],
	author_id: [String], //array of strings
	parent_folder: String //if applicable
});