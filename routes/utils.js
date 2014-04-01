//Mongo
var songSchema = require('../models/schemas/song');

exports.createSong = function(req, res) {
	var song = new songSchema({
		title: req.body.title,
		artist: req.body.artist,
		genre: req.body.genre,
		});
	song.save(function (err, product, numberAffected) {
			if (err) {
				console.log(err);
				res.status(500).json({status: 'fail'});
				return;
			}
			console.log(product);
			console.log('success!');
			res.render('editsong.ejs', {title: 'enchord', isNew: false, song: product, message: 'successfully \
			saved'});
			});
};

exports.editSong = function(req, res) {
	
};

exports.deleteSong = function(req, res) {
	
};

//req.body
// : title. artist genre


// get data from form
	
// validate data
	//check not empty (only title and artist required)
	//
// create object with data
	//var Song = new songSchema({})
// save data
	/*
	Room.save(function (err, product, numberAffected) {
			if (err) {
				console.log(err);
				res.status(500).json({status: 'fail'});
				return;
			}
			console.log('success!');
			res.render('room_admin.ejs', {roomid: product._id, roomname: product.roomname});
	*/
// make sure save is ok
	
// redirect to new page based on results



//get Song
/*
songSchema.find( {
*/
