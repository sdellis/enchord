//Mongo
var songSchema = require('../models/schemas/song');
var ObjectId = require('mongoose/lib/types/objectid'); //for testing
/*
var songEmpty = {
		title: '',
		artist: '',
		genre: '',
		data: ''
		};*/

exports.createSong = function(req, res) {
	var userid = getUserId(req);
	var song = new songSchema({
		title: req.body.title,
		artist: req.body.artist,
		author: userid,
		genre: req.body.genre,
		data: req.body.data,
		pub: req.body.pub
		});
	
	if(!checkFields(song, res))
		return;
		
	song.save(function (err, product, numberAffected) {
			if (err) {
				console.log(err);
				res.status(500).json({message: 'Internal server error: Cannot create', hasError: true});
				return;
			}
			console.log('success saved');
			res.send({song: song, message: 'Successfully created', hasError: false, isNew: false});
			// res.render('editsong.ejs', {title: 'enchord', isNew: false, song: product, message: 'successfully saved'});
			});
};

exports.editSong = function(req, res) {
	var id = req.body._id;
	var song = new songSchema({
		title: req.body.title,
		artist: req.body.artist,
		genre: req.body.genre,
		data: req.body.data,
		pub: req.body.pub
		});
	
	if(!checkFields(song, res))
		return;
	
	findSong(id, function(docs) {
		songSchema.update({_id: id}, {title: song.title, artist: song.artist, genre: song.genre, data: song.data, pub: song.pub}, function(err, numberAffected, rawResponse) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'Internal server error: Cannot edit', hasError: true});
			return;
		}
		console.log('success edit');
		res.send({song: song, message: 'Successfully saved', hasError: false, isNew: false});
		return;
		});
	
	});

};

exports.loadSong = function(req, res) {
	var id = req.params._id;
	
	var findsong = findSong(id, function(docs) {
		res.render('editsong.ejs', {title: 'enchord', isNew: false, song: docs, message: 'Song loaded'});
	});
}



exports.deleteSong = function(req, res) {
	var id = req.body._id;

	findSong(id, function(docs) {
		songSchema.remove({_id: id}, function(err) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'Internal server error: Cannot delete', hasError: true});
			return;
		}
		console.log('success delete');
		res.send({message: 'Successfully deleted', hasError: false, isNew: false, isDeleted: true});
		return;
		});
	});

};

exports.searchSong = function(req, res) {
	var query = req.params.query;
	var array = [];
	if (query == '') {
		res.render('search.ejs', {title: 'enchord', isNew: false, results: array, query: query, message: 'Empty query'});
		return;
	}
	else {
		songSchema.find({title: query}, function(err, docs) {
			if (err) {
				console.log(err);
				res.status(500).json({message: 'Internal server error: cannot find', hasError: true});
				return;
			}
			console.log(docs);
			array = docs;
			res.render('search.ejs', {title: 'enchord', isNew: false, results: array, query: query, message: 'Search results'});
			return;
		});
	}
}

function checkFields(song, res) {
	if (song.title.trim() == '') {
		console.log('empty title');
		res.send({song: song, message: 'Error: Empty title', hasError: true, isNew: true});
		return false;
	}
	if (song.artist.trim() == '') {
		console.log('empty artist');
		res.send({song: song, message: 'Error: Empty artist', hasError: true, isNew: true});
		return false;
	}
	return true;
}

function getUserId(req) {
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

function findSong(id, callback) {
	songSchema.findById(id, function (err, docs) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'find error', hasError: true});
			return;
		}
		if (docs == null) {
			console.log('Song not found');
			res.send({message: 'Cannot find song', hasError: false, isNew: false, isDeleted: false});
			//res.status(500).json({message: 'Internal server error: Cannot find song to delete', hasError: true});
			return;
		}
		callback(docs);
	});

}


