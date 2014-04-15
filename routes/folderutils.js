//Mongo
var songSchema = require('../models/schemas/song');
var userSchema = require('../models/schemas/user');
var folderSchema = require('../models/schemas/folder');
var fs = require('fs');
var ObjectId = require('mongoose/lib/types/objectid'); //for testing

/*
exports.getUserFolders = function(req, res) {
	var authorid = getId(req);
	var folders = [];
	userSchema.findById(authorid, function(err, docs) {
		if (docs['folders'] == undefined) {
			var folder = new folderSchema({
			folder_name: 'All Songs',
			song_list: [],
			creator: getId(req)
			});
		}
		
	});
}*/