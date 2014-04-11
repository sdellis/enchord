var mongoose = require('mongoose');

module.exports = mongoose.model('folder', {
	folder_name: String,
	song_list: Array,
	creator: String
});