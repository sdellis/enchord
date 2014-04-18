//Mongo
var songSchema = require('../models/schemas/song');
var userSchema = require('../models/schemas/user');
var folderSchema = require('../models/schemas/folder');
var fs = require('fs');
var utils = require('./utils');
var ObjectId = require('mongoose/lib/types/objectid'); //for testing


exports.getUserFolders = function(req, res) {
	var authorid = getAuthorId(req);
	var authorname = getAuthorName(req);
	var folders = [];
	
	folderSchema.find({author_id: authorid}, function(err, docs) {
		res.render('folderview.ejs', {
			title: 'enchord', 
			isNew: false, 
			authorName: authorname,
			results: docs
		});
	});
}

exports.getFolderSongs = function(req, res) {
	var folderid = req.params._id;
	folderSchema.findById(folderid, function(err, docs) {
		var foldername = docs.name;
		songSchema.find({folder_id: folderid}, function(err, docs) {
			if (err) {
				console.log(err);
				res.status(500).json({message: 'Internal server error: cannot find', hasError: true});
				return;
			}
			console.log(docs);
			res.render('foldersongs.ejs', {
				title: 'enchord', 
				isNew: false, 
				folderName: foldername,
				results: docs
			});
			return;
		});
		return;
	});
}

exports.makeFolder = function(req, res) {
	var foldername = req.params.name;
	var authorid = getAuthorId(req);
	var authorname = getAuthorName(req);
	var folder = new folderSchema({
		name: foldername,
		author_id: authorid,
		author_name: [authorname],
		parent_folder: ''
	});
	folder.save(function(err, docs, numberAffected) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'Internal server error: Cannot create', hasError: true});
			return;
		}
		console.log('success folder saved');
		console.log(folder);
		
		res.render('foldersongs.ejs', {title: 'enchord', isNew: false, folderName: foldername, results: ''});
		return;
	});
}

//maybe make it similar to how editSong works? also later just make an editFolder page to have option to share
exports.shareFolder = function(req, res) {
	var newuser = req.params.username; //using name for now because that's how other people will search(use id later)
	var folderid = req.params.folderid;
	
	
	folderSchema.findById(folderid, function(err, docs) {
		var authorids = docs['author_id'].push(newuser);
		folderSchema.update({_id: folderid}, {author_id: authorids}, function(err, numberAffected, rawResponse) {
			if (err) {
				console.log(err);
				res.status(500).json({message: 'Internal server error: Cannot edit', hasError: true});
				return;
			}
			console.log('success edit');
			res.render('folderview.ejs', {
				title: 'enchord', 
				isNew: false, 
				authorName: '',
				results: []
			});
			return;
		});	
	});
}

function getAuthorId(req) {
	var id;
	if (req.user.local.email) {
		id = req.user._id;
	}
	if (req.user.facebook.token) {
		id = req.user.facebook.id;
	}
	if (req.user.twitter.token) {
		id = req.user.twitter.id;
	}
	if (req.user.google.token) {
		id = req.user.google.id;
	}
	return id;
}

function getAuthorName(req) {
	var name;
	if (req.user.local.email) {
		name = req.user.local.user;
	}
	if (req.user.facebook.token) {
		name = req.user.facebook.name;
	}
	if (req.user.twitter.token) {
		name = req.user.twitter.username;
	}
	if (req.user.google.token) {
		name = req.user.google.name;
	}
	return name;
}