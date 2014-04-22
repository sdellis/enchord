//Mongo
var songSchema = require('../models/schemas/song');
var userSchema = require('../models/schemas/user');
var folderSchema = require('../models/schemas/folder');
var parser = require('../parsers/textparser'); // parser
var htmlparser = require('../parsers/htmlparser'); // parser
var fs = require('fs');
var ObjectId = require('mongoose/lib/types/objectid'); //for testing
var grabzit = require("grabzit");
var client = new grabzit("Y2JiZmJlMjM4M2Y3NDIxNzlhZGNjZDI0OWFkZThkZjg=", 
						"KQA/Pz8DKQ4/Pz8/fT9MIT8/Pz8/GV4ePz8/Pz9jPz8="); // pdf

exports.createSong = function(req, res) {
	var song = new songSchema({
		title: req.body.title,
		title_lower: req.body.title.toLowerCase(),
		artist: req.body.artist,
		artist_lower: req.body.artist.toLowerCase(),
		author_id: getAuthorId(req),
		author_name: getAuthorName(req), //original creator
		author_lower: getAuthorName(req).toLowerCase(),
		genre: req.body.genre,
		genre_lower: req.body.genre.toLowerCase(),
		data: req.body.data,
		pub: req.body.pub,
		upvote: 0,
		search_string: req.body.title.toLowerCase().concat(' ', req.body.artist.toLowerCase()).split(' '), //actually an array
		folder_id: '',
		band_id: '',
		isBand: false
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
		console.log(song);
		
		res.send({song: song, message: 'Successfully created', hasError: false, isNew: false});
		return;
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
		search_string: req.body.title.toLowerCase().concat(' ', req.body.artist.toLowerCase()).split(' '),
		});
	
	if(!checkFields(song, res))
		return;
	
	findSong(id, res, function(docs) {
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
	
	var findsong = findSong(id, res, function(docs) {
		res.render('editsong.ejs', {title: 'enchord', isNew: false, song: docs, message: 'Song loaded'});
	});
}

//EDIT THIS--------------------------------------------------------------------------------------------------------

exports.isAuthor = function(req, res, next) {
	var id = req.params._id;
	
	var findsong = findSong(id, res, function(docs) {
		if (req.isAuthenticated()) {
		
			if (docs['isBand'] == false) {
				//if (docs.author_id.indexOf(getAuthorId(req)) >= 0) {
				if (getAuthorId(req) == docs.author_id) {
					return next();
				} else {
					// send message too?
					res.redirect('/viewsong/' + id);
				}
			}
			else {
				bandSchema.find({_id: docs['band_id']}, function(err, docs) {
					var isInBand = docs['members'].indexOf({id: getAuthorId(req), name: getAuthorName(req)});
					if (isInBand == -1) {
						res.redirect('/viewsong/' + id);
					}
					else {
						return next();
					}
				});
			}
		
		
		} else {
			res.redirect('/login');
		}
	});
}

//EDIT THIS--------------------------------------------------------------------------------------------------------------
exports.loadSongView = function(req, res) {
	var id = req.params._id;
	
	var findsong = findSong(id, res, function(docs) {
		var isAuthor;
		var isLoggedIn;
		if (req.isAuthenticated()) {
			isLoggedIn = true;
			
			if (docs['isBand'] == false) {
				//if (docs.author_id.indexOf(getAuthorId(req)) >= 0) {
				if (getAuthorId(req) == docs.author_id) {
					isAuthor = true;
				} else {
					isAuthor = false;
				}
			}
			else {
				bandSchema.find({_id: docs['band_id']}, function(err, docs) {
					var isInBand = docs['members'].indexOf({id: getAuthorId(req), name: getAuthorName(req)});
					if (isInBand == -1) {
						isAuthor = false;
					}
					else {
						isAuthor = true;
					}
				});
			}
			
			
			
			
			
			
			
			
			
			//if (docs.author_id.indexOf(getAuthorId(req)) >= 0) {
			/*
			if (getAuthorId(req) == docs.author_id) {
				isAuthor = true;
			} else {
				isAuthor = false;
			}*/
		} else {
			isAuthor = false;
			isLoggedIn = false;
		}
		console.log("Is logged in:" + isLoggedIn);
		console.log("Original Author:" + isAuthor);
		res.render('viewsong.ejs', {
			title: 'enchord', 
			isNew: false, 
			isAuthor: isAuthor, 
			isLoggedIn: isLoggedIn, 
			song: docs, 
			message: 'Song loaded'
		});
	});
}

exports.downloadSongTxt = function(req, res) {
	var id = req.params._id;

	findSong(id, res, function(docs) {
		console.log(docs);
		if (docs) {
			parser.parseSong(docs.data, function(parsedSong) {
				fs.writeFile('./' + id + '.txt', parsedSong, function(err) {
					if(err) {
						console.log(err);
						res.status(500).json({message: 'Internal server error: Cannot delete', hasError: true});
						return;
					} else {
						console.log('success!');
						var titlewords = docs.title.split(" ");
						var filename = "";
						for (var i = 0; i < titlewords.length; i++) {
							if (i == titlewords.length - 1) {
								filename = filename + titlewords[i] + ".txt";
							} else {
								filename = filename + titlewords[i] + "_";
							}
						}
						res.download('./' + id + '.txt', filename, function(err) {
							if (err) {
								console.log(err);
								res.status(500).json({message: 'Internal server error: Cannot download', hasError: true});
								// fs.unlink('./' + id + '.txt', function (err) {
								// 	if (err) {
								// 		console.log(err);
								// 		res.status(500).json({message: 'Internal server error: Cannot delete', hasError: true});
								// 		return;
								// 	} else {
								// 		console.log('success delete file');
								// 	}
								// });
								return;
							} 
							fs.unlink('./' + id + '.txt', function (err) {
								if (err) {
									console.log(err);
									res.status(500).json({message: 'Internal server error: Cannot delete', hasError: true});
									return;
								} else {
									console.log('success delete file');
								}
							});
						});
					}
				});
			});
		}
	});
}

// exports.downloadSongPdf = function(req, res) {
// 	console.log("here");
// 	client.set_pdf_options("http://www.google.com");
// 	console.log("here2");
// 	client.save("http://enchord.herokuapp.com/handler");
// }

// exports.downloadSongPdfHandler = function(req, res) {
// 	client.get_result(req.query.id, function(err, result){
// 		console.log("In handler");
//     	fs.writeFile('test.pdf', result);
// 	});
// }

exports.deleteSong = function(req, res) {
	var id = req.body._id;

	findSong(id, res, function(docs) {
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

/*
exports.searchSong = function(req, res) {
	var query = {};
	var query1 = {};
	var query2 = {}; //break into 2 queries for easy or statement for Both
	if (req.query.query == undefined) {
		query['search_string'] = '';
	}
	else {
		query['search_string'] = {$all: req.query.query.toLowerCase().split(' ')};
	}
	if (req.query.type == 'Global' || req.query.type == undefined) {
		query['pub'] = true;
	}
	else if (req.query.type == 'Local') {
		query['author_id'] = getAuthorId(req);
	}
	else if (req.query.type == 'Both') {
		query1['search_string'] = query['search_string'];
		query2['search_string'] = query['search_string'];
		query1['pub'] = true;
		query2['pub'] = false;
		query2['author_id'] = getAuthorId(req);
		query = {};
		query['$or'] = [query1, query2];
	}

	// you should put this on top
	var type;
	if (req.query.type == undefined)
		type = 'Global';
	else
		type = req.query.type;
	console.log(query);

	var originalQuery = {
		query: req.query.query,
		title: "",
		artist: "",
		genre: "",
		author: "",
		type: type
	};
	var array = [];
	if (query['search_string'] == '') {
		res.render('search.ejs', {
			title: 'enchord', 
			isNew: false, 
			results: [], 
			query: query, 
			type: type, 
			message: 'Empty query', 
			isLoggedIn: req.isAuthenticated()
		});
		return;
	}
	else {
		songSchema.find(query, function(err, docs) {
			searchResults(err, docs, originalQuery, req, res);
		});
	}
}*/


exports.searchSong = function(req, res) {
	var query1 = {isBand: false}; //do the global search; if song is in band, it is not searchable
	var query2 = {isBand: false}; //break into 2 queries for easy or statement for Both
	if (req.query.query == undefined) {
		query1['search_string'] = '';
		query2['search_string'] = '';
	}
	else {
		query1['search_string'] = {$all: req.query.query.toLowerCase().split(' ')};
		query2['search_string'] = {$all: req.query.query.toLowerCase().split(' ')};
	}
	query1['pub'] = true;
	query2['pub'] = false;
	if (req.isAuthenticated()) {
		query2['author_id'] = getAuthorId(req);
	}
	else {
		query2 = {'search_string': ''}; //not logged in, do not search private songs
	}
	var originalQuery = {
		query: req.query.query,
		title: "",
		artist: "",
		genre: "",
		author: "",
	};
	var search_results = {global: [], local: []};
	if (query1['search_string'] == '') {
		return;
	}
	else {
		songSchema.find(query1, function(err, docs) {
			search_results['global'] = docs;
			songSchema.find(query2, function(err, docs) {
				search_results['local'] = docs;
				searchResults(err, search_results, originalQuery, req, res); //FIX THIS PART
			});
		});
	}
}






exports.advancedSearch = function(req, res) {
	var qTitle, qArtist, qGenre, qAuthor, qType;
	if (req.query.title == undefined)
		qTitle = '';
	else
		qTitle = req.query.title.toLowerCase(); 
	console.log(qTitle);
	if (req.query.artist == undefined)
		qArtist = '';
	else
		qArtist = req.query.artist.toLowerCase();
	console.log(qArtist);
	if (req.query.genre == undefined)
		qGenre = '';
	else
		qGenre = req.query.genre.toLowerCase();
	console.log(qGenre);
	if (req.query.author == undefined)
		qAuthor = '';
	else
		qAuthor = req.query.author.toLowerCase();
	console.log(qAuthor);
	
	var query1 = {isBand: false}; //if song belongs to a band, it is always not searchable
	var query2 = {isBand: false};
	
	if (qTitle != '') {
		query1['title_lower'] = qTitle;
		query2['title_lower'] = qTitle;
	}
	if (qArtist != '') {
		query1['artist_lower'] = qArtist;
		query2['artist_lower'] = qArtist;
	}
	if (qGenre != '') {
		query1['genre_lower'] = qGenre;
		query2['genre_lower'] = qGenre;
	}
	if (qAuthor != '') {
		query1['author_lower'] = qAuthor;
	}
	
	query1['pub'] = true;
	query2['pub'] = false;
	if (req.isAuthenticated()) {
		query2['author_id'] = getAuthorId(req);
	}
	else {
		query2 = {'search_string': ''}; //not logged in, do not search private songs
	}
	
	var originalQuery = {
		query: "",
		title: req.query.title, 
		artist: req.query.artist,
		genre: req.query.genre,
		author: req.query.author,
	};
	var search_results = {global: [], local: []};
	if (qTitle == '' && qArtist == '' && qGenre == '' && qAuthor == '')
		res.render('search.ejs', {
			title: 'enchord', 
			isNew: false, 
			results: search_results, 
			query: '', 
			message: 'Empty search',
			isLoggedIn: req.isAuthenticated()
		});
	else
	{
		console.log(query2);
		songSchema.find(query1, function(err, docs) {
			search_results['global'] = docs;
			songSchema.find(query2, function(err, docs) {
				search_results['local'] = docs;
				searchResults(err, search_results, originalQuery, req, res); //FIX THIS PART
			});
		});
	}
}

exports.getArtistSongs = function(req, res) {
	var query = {isBand: false};
	query['artist_lower'] = req.params.query.toLowerCase();
	query['pub'] = true;
	
	var queryprivate = {isBand: false};
	queryprivate['pub'] = false;
	if (req.isAuthenticated()) {
		queryprivate['artist_lower'] = req.params.query.toLowerCase();
		queryprivate['author_id'] = getAuthorId(req);
	}
	else { //makes it so the or will not return anything (will only get the public songs)
		queryprivate['artist_lower'] = '';
		queryprivate['author_name'] = '';
	}
	var array = [];
	if (query['artist_lower'] == '') {
		res.render('search.ejs', {
			title: 'enchord', 
			isNew: false, 
			results: array, 
			query: req.params.query, 
			message: 'Empty query',
			isLoggedIn: req.isAuthenticated()
		});
		return;
	}
	else {
		songSchema.find({$or: [query, queryprivate]}, function(err, docs) {
			if (err) {
				console.log(err);
				res.status(500).json({
					message: 'Internal server error: cannot find', 
					hasError: true
				});
				return;
			}
			console.log(docs);
			array = docs;
			res.render('artistpage.ejs', {
				title: 'enchord', 
				isNew: false, 
				results: array, 
				artist: req.params.query, 
				message: 'Search results'
			});
			return;
		});
	}

}

//currently searches whole database each time

function getMySongs(req, res, callback) {
	var authorid = getAuthorId(req);
	console.log(authorid);
	songSchema.find({author_id: authorid, isBand: false}, function(err, docs) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'Internal server error: cannot find', hasError: true});
			return;
		}
		console.log(docs);
		callback(docs);
		// res.send({usersongs: array});
		// res.render('search.ejs', {title: 'enchord', isNew: false, results: array, query: authorid, message: 'Search results'});
		// return;
	});	
}
exports.getMySongs = getMySongs;

exports.getUserSongs = function(req, res) {
	getMySongs(req, res, function(docs){
		console.log("in get user songs");
		res.send({usersongs: docs});
		return;
	});
		// res.send({usersongs: array});
		// res.render('search.ejs', {title: 'enchord', isNew: false, results: array, query: authorid, message: 'Search results'});
		// return
	
}


exports.getSong = function(req, res) {
	console.log(req.params);
	findSong(req.params._id, res, function(data) {
		res.send({song: data});
	});
}

//remake the songs so that they are updated to have new info
/*
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
			author_lower: array[i].author_name.toLowerCase(),
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
				res.render('search.ejs', {title: 'enchord', isNew: false, results: array, query: ' ', message: 'Search results',
					isLoggedIn: req.isAuthenticated()});
				return;
			});	
		
		}
		return;
	});

}*/

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
exports.getId = getAuthorId;

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
exports.getUsername = getAuthorName;

function findSong(id, res, callback) {
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


function searchResults(err, results, query, req, res) {
	if (err) {
		console.log(err);
		res.status(500).json({message: 'Internal server error: cannot find', hasError: true});
		return;
	}
	console.log(results.global);
	console.log(results.local);
	console.log(query);
	//array = docs;
	// res.render('search.ejs', {
	// 	title: 'enchord', 
	// 	isNew: false, 
	// 	results: docs, 
	// 	query: query, 
	// 	message: 'Search results', 
	// 	isLoggedIn: req.isAuthenticated()
	// });
	res.send({results: results, query: query});
	return;
}



/*exports.editSong = function(req, res) {
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
	
	findSong(id, res, function(docs) {
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
};*/

exports.upvote = function(req, res) {
	console.log(req.body);
	var id = req.body._id;
	songSchema.findById(id, function(err, docs) {
		if (err) {
			console.log(Err);
			return;
		} else if (docs == null) {
			console.log('song not found');
			return;
		} else {
			var userid = getAuthorId(req);
			var index = docs.rates.indexOf(userid);
			if (index == -1) {
				console.log(docs);
				console.log(userid);
				docs.rates.push(userid);
				docs.upvote++;
				docs.save(function(err, count) {
					if (err) {
						console.log(err);
					}
					console.log(docs.upvote);
					res.send({vote: docs.upvote});
				});
			} else {
				return;
			}
		}
	})
}

exports.undovote = function(req, res) {
	var id = req.body._id;
	songSchema.findById(id, function(err, docs) {
		if (err) {
			console.log(err);
			return;
		} else if (docs == null) {
			console.log('song not found');
			return;
		} else {
			var userid = getAuthorId(req);
			var index = docs.rates.indexOf(userid);
			if (index == -1) {
				return;
			} else {
				docs.upvote--;
				docs.rates.splice(index, 1);
				docs.save(function(err, count) {
					if (err) {
						console.log(err);
					}
					console.log(docs.upvote);
					res.send({vote: docs.upvote});
				});
				return;
			}
		}
	});
}

exports.hasvoted = function(req, res) {
	var songid = req.query._id;
	songSchema.findById(songid, function(err, docs) {
		if (err) {
			console.log(err);
			return;
		} else if (docs == null) {
			console.log('which song?');
			return;
		} else {
			var userid = getAuthorId(req);
			var index = docs.rates.indexOf(userid);
			if (index == -1) {
				res.send({voted: false});
				return;
			} else {
				res.send({voted: true});
				return;
			}
		}
	});
}
