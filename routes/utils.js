//Mongo
var songSchema = require('../models/schemas/song');

var songEmpty = {
		title: '',
		artist: '',
		genre: '',
		};

exports.createSong = function(req, res) {
	var song = new songSchema({
		title: req.body.title,
		artist: req.body.artist,
		genre: req.body.genre
		});
	if (song.title.trim() == '') {
		console.log('empty title');
		res.render('editsong.ejs', {title: 'enchord', isNew: true, song: songEmpty, message: 'Empty title'});
	}
	if (song.artist.trim() == '') {
		console.log('empty artist');
		res.render('editsong.ejs', {title: 'enchord', isNew: true, song: songEmpty, message: 'Empty artist'});
	}
		
	song.save(function (err, product, numberAffected) {
			if (err) {
				console.log(err);
				res.status(500).json({status: 'fail'});
				return;
			}
			console.log('success saved');
			res.render('editsong.ejs', {title: 'enchord', isNew: false, song: product, message: 'successfully saved'});
			});
};

exports.editSong = function(req, res) {
	var id = req.body._id;
	
	var song = songSchema.find({_id: id}, function(err, docs) {
		if (err) {
			console.log(err);
			res.status(500).json({status: 'fail'});
			return;
		} 
	});
	
	song.update({title: req.body.title, artist: req.body.artist, genre: req.body.genre}, function(err, numberAffected, rawResponse) {
		if (err) {
			console.log(err);
			res.status(500).json({status: 'fail'});
			return;
		}
		console.log('success edit');
		res.redirect('/members');
		});
};

exports.deleteSong = function(req, res) {
	var id = req.body._id;
	
	songSchema.remove({_id: id}, function(err) {
		if (err) {
			console.log(err);
			res.status(500).json({status: 'fail'});
			return;
		}
		console.log('success delete');
		res.redirect('/members');
	});
};

//req.body
// : title. artist genre


// get data from form
	
// validate data
	//check not empty (only title and artist required)
	//done elsewhere
// create object with data

// save data

// make sure save is ok
	
// redirect to new page based on results



//get Song
/*
songSchema.find( {
*/
