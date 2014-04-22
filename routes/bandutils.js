var bandSchema = require('../models/schemas/band');
var userSchema = require('../models/schemas/user');
var folderSchema = require('../models/schemas/folder');
var songSchema = require('../models/schemas/song');
var utils = require('./utils');


// add member - make sure member exists
// delete member
// get members
// get all bands

// get username and id of current user


exports.createBand = function(req, res) {
	var id = utils.getId(req);
	var username = utils.getUsername(req);

	var newBand = new bandSchema( {
		name: req.body.bandname,
		leader: {id: id, name: username}
	});
	newBand.member.push({id: id, name: username});
	newBand.save(function(err, band) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'Internal server error: Cannot create', hasError:true});
		} else {
			res.send({band: band, message: 'Success', hasError: false});
		}
	});
};

//object  success: true/false
exports.addMembers = function(req, res) {
	var id = req.body.bandid;
	var toAdd = searchForMember(req.body.username);
	if (toAdd == null) {
		console.log('user doesnt exist');
		return {success: false};
	} else {
		var bandmembertoadd = {id: toAdd, name:req.body.username};
		findBand(id, res, function(band) {
			band.members.push(bandmembertoadd);
			band.save(function(err, docs) {
				if (err) {
					console.log('db error');
					return {success: false};
				} else {
					userSchema.findById(toAdd, function(err, docs) {
						docs.bands.append(id);
						docs.save(function(err, docs){
							if (err) {
								res.status(500).json({message: 'Internal server error: Cannot create', hasError: true});
							}
						});
					});
					return {success: true};
				}
			});
		});
	}
};

exports.removeMembers = function(req, res) {
	var id = req.body.bandid;
	var userid = req.body.userid;

	findBand(id, res, function(band) {
		userSchema.findById(userid, function(err, docs) {
			var bandid = docs.bands.indexOf(id);
			docs.bands.splice(bandid, 1);
			docs.save(function(err, docs) {
				if (err) {
					res.status(500).json({message: 'Internal server error: Cannot delete', hasError: true});
				}
			});
		});
		var index = findIndexOfMember(band.members, userid);
		band.members.splice(index, 1);
		band.save(function(err, docs) {
			if (err) {
				return {success: false};
			} else {
				return {success: true};
			}
		});
	});
};

exports.editBand = function(req, res) {
	var id = req.body.band._id;
	findBand(id, res, function(band) {
		if (band.leader.id != utils.getId(req)) {
			return {hasError:false, band: undefined};
		} else {
			band.name = req.body.bandname;
			band.save(function(err, docs) {
				if (err) {
					return {hasError: true};
				} else {
					return {hasError: false, band: docs};
				}
			});
		}
	});
};

exports.findband = function(req, res) {
	var id = req.params._id;
	findBand(id, res, function(band) {
		res.send({band: band});
	});
};

exports.findAllBands = function(req, res) {
	var userid = utils.getId(req);
	userSchema.findById(userid, function(err, docs) {
		if (err) {
			res.status(500).json({message: 'Internal server error: Cannot find bands', hasError: true});
		} else {
			return {bands: docs.bands};
		}
	});
};

function searchForMember(username) {
	userSchema.find({username: username}, function(err, docs){
		if (err) {
			return null;
		} else if (docs == null) {
			return null;
		} else {
			return docs._id;
		}
	});
};

function findBand(id, res, callback) {
	bandSchema.findById(id, function (err, docs) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'find error', hasError: true});
			return;
		}
		if (docs == null) {
			console.log('Band not found');
			res.send({message: 'Cannot find band', hasError: false, isNew: false, isDeleted: false});
			//res.status(500).json({message: 'Internal server error: Cannot find band to delete', hasError: true});
			return;
		}
		callback(docs);
	});
}

function findIndexOfMember(array, name) {
	for (var i = 0; i < array.length; i++ ) {
		if (array[i].name == name){
			return i;
		}
	}
	return -1;
}

exports.findBandFolder = function(req, res) {
	folderSchema.find({isBand: true, bandid: req.params._id}, function(err, folders) {
		if (err) {
			res.status(500).json({message: 'Internal server error: Cannot create song', hasError: true});
		} else {
			return {folder: folders};
		}
	})
};

exports.importFolder = function(req, res) {
	var newFolder = new folderSchema( {
		isBand: true,
		band_id: req.params.bandid
	});

	newFolder.save(function(err, docs) {
		var folderid = docs._id;
		songSchema.find({folder_id: folderid}, function(err, songs) {
			if (err) {
				res.status(500).json({message: 'Internal server error: Cannot create song', hasError: true});
				return {success:false};
			}
			for (var i = 0; i < songs.length; i++ ) {
				var newSong = new songSchema({
					title: songs[i].title,
					title_lower: songs[i].title_lower,
					artist: songs[i].artist,
					artist_lower: songs[i].artist_lower,
					author_id: undefined,
					author_name: undefined, //original creator
					author_lower: undefined,
					genre: songs[i].genre,
					genre_lower: songs[i].genre,
					data: songs[i].data,
					pub: false,
					upvote: 0,
					search_string: songs[i].search_string, //actually an array
					folder_id: folderid,
					band_id: req.params.bandid,
					isBand: true
				});
				newSong.save(function(err, data) {
					if (err) {
						res.status(500).json({message: 'Internal server error: Cannot create song', hasError: true});
						return {success:false};
					}
				})
			}
		});
	});
	return {success: true};
};

exports.deleteBand = function(req, res) {
	//delete songs related to band
	songSchema.remove({isBand: true, band_id:req.params._id}, function(err) {
		if (err) {
			res.status(500).json({message: 'Internal server error: Cannot delete song', hasError: true});
		}
	});

	//delete folders related to band
	folderSchema.remove({isBand: true, band_id:req.params._id}, function(err) {
		if (err) {
			res.status(500).json({message: 'Internal server error: Cannot delete song', hasError: true});
		}
	});

	//remove band from users
	bandSchema.findById(req.params._id, function(err, band) {
		if (err) {
			res.status(500).json({message: 'Internal server error: Cannot find band', hasError: true});	
		} else if (!band) {
			return {success: false};
		} else {
			for (var i = 0; i < band.members.length; i++ ) {
				userSchema.findById(band.members[i], function(err, mem) {
					var index = mem.bands.indexOf(req.params._id);
					mem.bands.splice(index, 1);
					mem.save(function(err, mem) {
						if (err) {
							res.status(500).json({message: 'Internal server error: Cannot delete band from user', hasError: true});
						}
					});
				});
			}
		}
	});

	//delete band
	bandSchema.remove({_id: req.params._id} function(err) {
		if (err) {
			res.status(500).json({message: 'Internal server error: Cannot delete band', hasError: true});
		}
	});

};