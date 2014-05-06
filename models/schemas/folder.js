var mongoose = require('mongoose');

module.exports = mongoose.model('folder', {
	name: String,
	author_name: String, //original creator of the folder(can be changed to array)
	author_id: String, //array of strings
});