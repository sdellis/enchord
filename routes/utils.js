//Mongo
var songSchema = require('../models/schemas/song');
var ObjectId = require('mongoose/lib/types/objectid');

var songEmpty = {
		title: '',
		artist: '',
		genre: '',
		data: ''
		};

exports.createSong = function(req, res) {
	var song = new songSchema({
		title: req.body.title,
		artist: req.body.artist,
		genre: req.body.genre,
		data: req.body.data
		});
	if (song.title.trim() == '') {
		console.log('empty title');
		res.send({song: song, message: 'Error: Empty title', hasError: true, isNew: true});
	}
	if (song.artist.trim() == '') {
		console.log('empty artist');
		res.send({song: song, message: 'Error: Empty artist', hasError: true, isNew: true});
	}
		
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
	var id = req.body._id; //USE OID NOT TITLE THIS IS ONLY FOR TESTING
	var song = new songSchema({
		title: req.body.title,
		artist: req.body.artist,
		genre: req.body.genre,
		data: req.body.data,
		_id: id
		});
	if (song.title.trim() == '') {
		console.log('empty title');
		res.send({song: song, message: 'Error: Empty title', hasError: true, isNew: true});
	}
	if (song.artist.trim() == '') {
		console.log('empty artist');
		res.send({song: song, message: 'Error: Empty artist', hasError: true, isNew: true});
	}	
	
	songSchema.update({_id: id}, {title: req.body.title, artist: req.body.artist, genre: req.body.genre, data: req.body.data}, function(err, numberAffected, rawResponse) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'Internal server error: Cannot edit', hasError: true});
			return;
		}
		console.log('success edit');
		res.send({song: song, message: 'Successfully saved', hasError: false, isNew: false});
		});
};

exports.deleteSong = function(req, res) {
	var id = req.body._id;
	//var testid = 'notgonnafindthis'; //not in db (on purpose)
	/*var findsong = songSchema.findOne({title: testid}, function (err, docs) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'find error', hasError: true});
			return;
		}});
	console.log(findsong);*/
	songSchema.remove({_id: id}, function(err) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'Internal server error: Cannot delete', hasError: true});
			return;
		}
		console.log('success delete');
		res.send({message: 'Successfully deleted', hasError: false, isNew: false, isDeleted: true});
	});
};
