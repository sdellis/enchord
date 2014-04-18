var songSchema = require('../models/schemas/song');
var userSchema = require('../models/schemas/user');
var folderSchema = require('../models/schemas/folder');
var bandSchema = require('../models/schemas/folder');

/*module.exports = mongoose.model('band', {
	band_name: String,
	band_members: [],
	leader: String
});*/

exports.createBand = function(req, res) {
	var newBand = new bandSchema();
	newBand.band_name = req.params.bandname;
	newBand.leader = req.params._id;
	for (var i = 0; i < req.params.members.length; i++) {
		newBand.band_members.append(req.params.members[i]);
	}

	newBand.save(function(err, band) {
		if (err) {
			console.log(err);
		} else {
			res.send(/*some object */);
		}
	});
};

exports.addMembers = function(req, res) {
	bandSchema.find({band_name: req.body.bandname}, function(err, band) {
		if (err) {
			console.log(err);
		}
		for (var i = 0; i < req.body.newmembers.length; i++) {
			band.band_members.apend(req.body.newmembers);
		}
		band.save();
	});
};

exports.editBand = function(req, res) {
	bandSchema.find({band_name: req.body.bandname}, function(err, band) {
		if (err) {
			console.log(err);
		}
		band.band_name = req.body.newbandname;
		band.save();
	});	

};

function searchForMembers(query) {
	
};