var bandSchema = require('../models/schemas/band');
var userSchema = require('../models/schemas/user');
var folderSchema = require('../models/schemas/folder');
var bandSchema = require('../models/schemas/folder');
var utils = require('./utils');


// add member - make sure member exists
// delete member
// get members
// get all bands

// get username and id of current user


exports.createBand = function(req, res) {
	var newBand = new bandSchema();
	newBand.band_name = req.body.band-name;
	newBand.leader = utils.getId(req);
	for (var i = 0; i < req.params.members.length; i++) {
		newBand.band_members.append(req.body.members[i]);
	}

	newBand.save(function(err, band) {
		if (err) {
			console.log(err);
			res.status(500).json({message: 'Internal server error: Cannot create', hasError:true});
		} else {
			res.send({band: band, message: 'Success', hasError: false});
		}
	});
};

/*exports.addMembers = function(req, res) {
	bandSchema.find({band_name: req.body.bandname}, function(err, band) {
		if (err) {
			console.log(err);
		}
		for (var i = 0; i < req.body.newmembers.length; i++) {
			band.band_members.push(req.body.newmembers);
		}
		band.save();
	});
};

exports.removeMembers = function(req, res) {
	bandSchema.find({band_name: req.body.bandname}, function(err, band) {
		if (err) {
			console.log(err);
		}
		var index = band.band_members.indexOf(req.body.removemem);
		band.band_members.splice(index, 1);
		band.save();
	})
}*/

exports.editBand = function(req, res) {
	bandSchema.find({band_name: req.body.bandname}, function(err, band) {
		if (err) {
			console.log(err);
		}
		band.band_name = req.body.newbandname;

		for(var i = 0; i < req.body.remove; i++) {
			var index = band.band_members.indexOf(req.body.remove[i]);
			band.band_members.splice(index, 1);
		}

		for(var i = 0; i < req.body.add; i++) {
			band.band_members.push(req.body.add[i]);
		}
		//remove members
		//add members
		band.save();
	});	
};

exports.loadBandEdit = function(req, res) {
	var id = req.params._id;

	findBand(id, res, function(band) {
		res.render('editband.ejs', {title: 'enchord', isNew: false, band: band, message: 'done'});
	})
};

exports.loadBandView = function(req, res) {
	var id = req.params._id;
	
	findBand(id, res, function(docs) {
		var isAuthor;
		var isLoggedIn;
		if (req.isAuthenticated()) {
			isLoggedIn = true;
			
			if (docs.leader == utils.getAuthorId(req)) {
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
		res.render('viewband.ejs', {
			title: 'enchord', 
			isNew: false, 
			isAuthor: isAuthor, 
			isLoggedIn: isLoggedIn, 
			band: docs, 
			message: 'Band loaded'
		});
	});
}


exports.isBandLeader = function(req, res, next) {
	var id = req.params._id;

	findBand(id, res, function(band) {
		if (req.isAuthenticated()) {
			if (band.leader == utils.getAuthorId(req)) {
				return next();
			} else {
				res.redirect('/viewband' + id);
			}
		} else {
			res.redirect('/login');
		}
	});
}

function searchForMembers(query) {
	
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

