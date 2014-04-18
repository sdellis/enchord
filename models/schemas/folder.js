var mongoose = require('mongoose');

module.exports = mongoose.model('folder', {
	name: String,
	author_name: String, //original creator of the folder(can be changed to array)
	//shared: [String],
	author_id: [String], //array of strings
	band_id: String, //to get band folders, search for this in folderSchema. Set to '' if no band
	parent_folder: String //if applicable, set to ,, if no parent folder(save as id)
});