//Mongo
var songSchema = require('../models/schemas/song');
var ObjectId = require('mongoose/lib/types/objectid'); //for testing

exports.createSong = function(req, res) {
	var song = new songSchema({
		title: req.body.title,
		title_lower: req.body.title.toLowerCase(),
		artist: req.body.artist,
		artist_lower: req.body.artist.toLowerCase(),
		author_id: getAuthorId(req),
		author_name: getAuthorName(req),
		genre: req.body.genre,
		genre_lower: req.body.genre.toLowerCase(),
		data: req.body.data,
		pub: req.body.pub,
		search_string: req.body.title.toLowerCase().concat(' ', req.body.artist.toLowerCase()).split(' ') //actually an array
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
		console.log(song.search_string);
		console.log(song);
		res.send({song: song, message: 'Successfully created', hasError: false, isNew: false});
		// res.render('editsong.ejs', {title: 'enchord', isNew: false, song: product, message: 'Successfully created'});
	});
};

exports.editSong = function(req, res) {
	var id = req.body._id;
	var song = new songSchema({
		title: req.body.title,
		title_lower: req.body.title.toLowerCase(),
		artist: req.body.artist,
		artist_lower: req.body.artist.toLowerCase(),
		genre: req.body.genre,
		genre_lower: req.body.genre.toLowerCase(),
		data: req.body.data,
		pub: req.body.pub,
		search_string: req.body.title.toLowerCase().concat(' ', req.body.artist.toLowerCase()).split(' ')
		});
	
	if(!checkFields(song, res))
		return;
	
	findSong(id, function(docs) {
		songSchema.update({_id: id}, {title: song.title, title_lower: song.title_lower, artist: song.artist, 
		artist_lower: song.artist_lower, genre: song.genre, genre_lower: song.genre_lower, data: song.data, 
		pub: song.pub, search_string: song.search_string}, function(err, numberAffected, rawResponse) {
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

exports.loadSongEdit = function(req, res) {
	var id = req.params._id;
	
	var findsong = findSong(id, function(docs) {
		res.render('editsong.ejs', {title: 'enchord', isNew: false, song: docs, message: 'Song loaded'});
	});
}

exports.loadSongView = function(req, res) {
	var id = req.params._id;
	
	var findsong = findSong(id, function(docs) {
		res.render('viewsong.ejs', {title: 'enchord', isNew: false, song: docs, message: 'Song loaded'});
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

//add distinguish public vs private. Right now only searches public songs
exports.searchSong = function(req, res) {
	var query = req.params.query.toLowerCase().split(' ');
	console.log(query);
	var array = [];
	if (query == '') {
		res.render('search.ejs', {title: 'enchord', isNew: false, results: array, query: req.params.query, message: 'Empty query'});
		return;
	}
	else {
		songSchema.find({search_string: {$all: query}, pub: true}, function(err, docs) {
			if (err) {
				console.log(err);
				res.status(500).json({message: 'Internal server error: cannot find', hasError: true});
				return;
			}
			console.log(docs);
			array = docs;
			res.render('search.ejs', {title: 'enchord', isNew: false, results: array, query: req.params.query, message: 'Search results'});
			return;
		});
	}
}

exports.advancedSearch = function(req, res) {
	var qTitle = req.params.title.toLowerCase(); 
	var qArtist = req.params.artist.toLowerCase();
	var qGenre = req.params.genre.toLowerCase();
	var array = [];
	songSchema.find({title_lower: qTitle, artist_lower: qArtist, genre_lower: qGenre, }, function(err, docs) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'Internal server error: cannot find', hasError: true});
			return;
		}
		console.log(docs);
		array = docs;
		res.render('search.ejs', {title: 'enchord', isNew: false, results: array, query: qTitle, message: 'Search results'});
		return;
	});
}

exports.getArtistSongs = function(req, res) {
	var query = req.params.query.toLowerCase();
	var array = [];
	if (query == '') {
		res.render('search.ejs', {title: 'enchord', isNew: false, results: array, query: req.params.query, message: 'Empty query'});
		return;
	}
	else {
		songSchema.find({artist_lower: query}, function(err, docs) {
			if (err) {
				console.log(err);
				res.status(500).json({message: 'Internal server error: cannot find', hasError: true});
				return;
			}
			console.log(docs);
			array = docs;
			res.render('search.ejs', {title: 'enchord', isNew: false, results: array, query: req.params.query, message: 'Search results'});
			return;
		});
	}

}

//currently searches whole database each time, should store the song ids in user and then simply get those song ids

exports.getMySongs = function(req, res) {
	var authorid = getAuthorId(req);
	var array = [];
	songSchema.find({author_id: authorid}, function(err, docs) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'Internal server error: cannot find', hasError: true});
			return;
		}
		console.log(docs);
		array = docs;
		res.render('search.ejs', {title: 'enchord', isNew: false, results: array, query: authorid, message: 'Search results'});
		return;
	});
	
}



exports.getSong = function(req, res) {
	findSong(req.params._id, function(data) {
		res.send({song: data});
	});
}



//remake the songs so that they are updated to have new info

exports.remakeDB = function(req, res) {
	var array = [];
	songSchema.find(function(err, docs) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'Internal server error: cannot find', hasError: true});
			return;
		}
		console.log(docs);
		array = docs;
		for (var i = 0; i < array.length; i++) {
			var song = new songSchema({
			title: array[i].title,
			title_lower: array[i].title.toLowerCase(),
			artist: array[i].artist,
			artist_lower: array[i].artist.toLowerCase(),
			genre: array[i].genre,
			genre_lower: array[i].genre.toLowerCase(),
			data: array[i].data,
			pub: array[i].pub,
			search_string: array[i].title.toLowerCase().concat(' ', array[i].artist.toLowerCase()).split(' ')
			});
		
		
			songSchema.update({_id: array[i]._id}, {title: song.title, title_lower: song.title_lower, artist: song.artist, 
			artist_lower: song.artist_lower, genre: song.genre, genre_lower: song.genre_lower, data: song.data, pub: song.pub, 
			search_string: song.search_string}, function(err, numberAffected, rawResponse) {
				if (err) {
					console.log(err);
					res.status(500).json({message: 'Internal server error: Cannot edit', hasError: true});
					return;
				}
				console.log('success edit');
				res.render('search.ejs', {title: 'enchord', isNew: false, results: array, query: ' ', message: 'Search results'});
				return;
			});	
		
		}
		return;
	});

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

function findSong(id, callback, res) {
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


