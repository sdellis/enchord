//Mongo
var songSchema = require('../models/schemas/song');
var userSchema = require('../models/schemas/user');
var folderSchema = require('../models/schemas/folder');
var parser = require('../parsers/textparser'); // parser
var htmlparser = require('../parsers/htmlparser'); // parser
var fs = require('fs');
var ObjectId = require('mongoose/lib/types/objectid'); //for testing

//------------------Song Related functions -------------------------------------------
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
		folder_id: ''
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
		
		res.send({song: song, message: 'Song Created', hasError: false, isNew: false});
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
			res.send({song: song, message: 'Song Saved', hasError: false, isNew: false});
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

//middleware
exports.isAuthor = function(req, res, next) {
	var id = req.params._id;
	
	var findsong = findSong(id, res, function(docs) {
		if (req.isAuthenticated()) {

			if (getAuthorId(req) == docs.author_id) {
				return next();
			} else {
				// send message too?
				res.redirect('/viewsong/' + id);
			}
		
		} else {
			res.redirect('/login');
		}
	});
}
//for get request
exports.isAuthorOfSong = function (req, res) {
	var id = req.query._id;

	findSong(id, res, function(docs) {
		if (req.isAuthenticated()) {
			if (getAuthorId(req) == docs.author_id) {
				res.send({isAuthor: true});
			} else {
				res.send({isAuthor: false});
			}
		} else {
			res.send({isAuthor: false});
		}
	});
}

exports.loadSongView = function(req, res) {
	var id = req.params._id;
	
	var findsong = findSong(id, res, function(docs) {
		var isAuthor;
		var isLoggedIn;
		if (req.isAuthenticated()) {
			isLoggedIn = true;

			if (getAuthorId(req) == docs.author_id) {
				isAuthor = true;
			} else {
				isAuthor = false;
			}
			
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
			user: req.user, 
			isLoggedIn: isLoggedIn, 
			song: docs, 
			message: 'Song loaded'
		});
	});
}

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
		res.send({message: 'Song Deleted', hasError: false, isNew: false, isDeleted: true});
		return;
		});
	});

};


exports.downloadSongTxt = function(req, res) {
	var id = req.params._id;

	findSong(id, res, function(docs) {
		console.log(docs);
		if (docs) {
			parser.parseSong(docs.data, function(parsedSong) {
				songtext = "Title: " + docs.title + "\nArtist: " + docs.artist + "\nAuthor: " + docs.author_name + "\n" + parsedSong;
				fs.writeFile('./' + id + '.txt', songtext, function(err) {
					if(err) {
						console.log(err);
						res.status(500).json({message: 'Internal server error: Cannot download', hasError: true});
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
									res.status(500).json({message: 'Internal server error: Cannot download', hasError: true});
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


//------------------------------------------------------------------------------------------------------------------


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

//------------------------------------------------Search Songs functions ---------------------

exports.searchSong = function(req, res) {
	var query1 = {}; //do the global search; if song is in band, it is not searchable
	var query2 = {}; //break into 2 queries for easy or statement for Both
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
	//var search_results = {global: [], local: []};
	var query = {$or: [query1, query2]};

	var search_results = {global: []};
	if (query1['search_string'] == '') {
		return;
	}
	else {
		songSchema.find(query, function(err, docs) {
			search_results['global'] = docs;
			searchResults(err, search_results, originalQuery, req, res);
		});
		/*
		songSchema.find(query1, function(err, docs) {
			search_results['global'] = docs;
			songSchema.find(query2, function(err, docs) {
				search_results['local'] = docs;
				searchResults(err, search_results, originalQuery, req, res);
			});
		});*/
	}
}

exports.advancedSearch = function(req, res) { //REMOVE QUERY2 LATER
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
	
	var query1 = {}; //if song belongs to a band, it is always not searchable
	var query2 = {};
	
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
		query2['author_lower'] = qAuthor;
	}
	
	query1['pub'] = true;
	query2['pub'] = false;
	
	if (req.isAuthenticated()) {
		query2['author_id'] = getAuthorId(req);//this way a username search will not show local songs of another user
	}
	else {
		query2['search_string'] = ''; //not logged in, do not search private songs
	}

	var query = {$or: [query1, query2]};
	
	var originalQuery = {
		query: "",
		title: req.query.title, 
		artist: req.query.artist,
		genre: req.query.genre,
		author: req.query.author,
	};
	//var search_results = {global: [], local: []};
	var search_results = {global: []};
	if (qTitle == '' && qArtist == '' && qGenre == '' && qAuthor == '')
		res.render('results.ejs', {
			isLoggedIn: req.isAuthenticated(),
			user: req.user, 
			username: getAuthorName(req),
			query: "",
			isAdvSearch: true,
			title: qTitle,
			artist: qArtist,
			genre: qGenre,
			author: qAuthor
		});
	else
	{
		songSchema.find(query, function(err, docs) {
			search_results['global'] = docs;
			searchResults(err, search_results, originalQuery, req, res);
		});
		/*
		songSchema.find(query1, function(err, docs) {
			search_results['global'] = docs;
			songSchema.find(query2, function(err, docs) {
				search_results['local'] = docs;
				searchResults(err, search_results, originalQuery, req, res);
			});
		});*/
	}
}

exports.getArtistSongs = function(req, res) {
	console.log('in getartistsongs');
	var query = {};
	query['artist_lower'] = req.params.query.toLowerCase();
	query['pub'] = true;
	
	var queryprivate = {};
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
			user: req.user, 
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
				//res.send({results: undefined});
				return;
			} else {
				console.log(docs);
				array = docs;
				/*res.render('artistpage.ejs', { 
					title: 'enchord', 
					isNew: false, 
					results: array, 
					username: getAuthorName(req),
					artist: req.params.query, 
					isLoggedIn: req.isAuthenticated(),
					message: 'Search results'
				});*/
				res.send({results: docs});
			}
		});
	}

}

function getMySongs(req, res, callback) {
	var authorid = getAuthorId(req);
	if (authorid == null) {
		return;
	}
	console.log(authorid);
	songSchema.find({author_id: authorid}, function(err, docs) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'Internal server error: cannot find', hasError: true});
			return;
		}
		// console.log(docs);
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

function findSong(id, res, callback) {
	songSchema.findById(id, function (err, docs) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'find error', hasError: true});
			return;
		}
		if (docs == null) {
			console.log('Song not found');
			res.send({message: 'Cannot Find Song', hasError: false, isNew: false, isDeleted: false});
			//res.status(500).json({message: 'Internal server error: Cannot find song to delete', hasError: true});
			return;
		}
		callback(docs);
	});
}

//-----------------------------------------end search functions -------------------------------

function checkFields(song, res) {
	if (song.title.trim() == '') {
		console.log('empty title');
		res.send({song: song, message: 'Error: Empty Title', hasError: true, isNew: true});
		return false;
	}
	if (song.artist.trim() == '') {
		console.log('empty artist');
		res.send({song: song, message: 'Error: Empty Artist', hasError: true, isNew: true});
		return false;
	}
	return true;
}

exports.getUserInfo = function(req, res) {
	if (!req.isAuthenticated()) {
		res.send({
			username: undefined,
			id: undefined
		});
	} else {
		var userid = getAuthorId(req);
		var username = getAuthorName(req);

		var user = {
			username: username,
			id: userid
		};

		res.send(user);
	}
}

function getAuthorId(req) {
	if (req.isAuthenticated()) {
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
	} else {
		return null;
	}
}
exports.getId = getAuthorId;

function getAuthorName(req) {
	if (req.isAuthenticated()) {
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
	} else {
		return null;
	}
}
exports.getUsername = getAuthorName;

function searchResults(err, results, query, req, res) {
	if (err) {
		console.log(err);
		res.status(500).json({message: 'Internal server error: cannot search', hasError: true});
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


//--------------------------------------Votes related functions ------------------------

exports.upvote = function(req, res) {
	console.log(req.body);
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
				console.log(docs);
				console.log(userid);
				docs.rates.push(userid);
				docs.upvote++;
				docs.save(function(err, count) {
					if (err) {
						console.log(err);
					}
					console.log(count.upvote);
					res.send({vote: count.upvote});
				});
			} else {
				res.send({vote: docs.upvote});
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
//----------------------------------------------------------------------------------


//make your variables oldpass, newpass, and confirmpass
//only works for local.
exports.changePass = function(req, res) {
	var username = getAuthorName(req);
	userSchema.findOne({'local.user' : username}, function(err, user) {
		if (err) {
			res.send({message: 'failed'});
		}
		if (user) {
			console.log(req.body.oldpass);
			console.log(user.validPassword(req.body.oldpass));
			if (user.validPassword(req.body.oldpass)) {
				if (req.body.newpass == req.body.confirmpass) {
					if (req.body.newpass == req.body.oldpass) {
						res.send({message: 'Please type in a new password'});
					}
					else {
						user.local.password = user.generateHash(req.body.newpass);
						user.save(function(err) {
						if (err)
							res.send({success: false, message: 'Failed'});
							res.send({success: true, message: 'Password Changed'});
						});
					}
				} else {
					res.send({success: false, message: 'Confirm password did not match new password'});
				}
			} else {
				res.send({success: false, message: 'The current password was incorrect'});
			}
		} else {
			res.send({success: false, message: 'Will Never Happen'});
		}
	});
}

exports.deleteUser = function(req, res) {
	var username = getAuthorName(req);
	if (req.user.local) {
		userSchema.findOne({'local.user':username}, function(err, user) {

		});
	} else if (req.user.facebook) {
		userSchema.findOne({'facebook.name':username}, function(err, user) {

		});
	} else if (req.user.twitter) {
		userSchema.findOne({'twitter.username':username}, function(err, user) {

		});
	} else if (req.user.google) {
		userSchema.findOne({'google.name':username}, function(err, user) {

		});
	}
}
