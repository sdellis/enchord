// Mongoose with mongolab
var mongoose = require('mongoose');
mongoose.connect('mongodb://jemah:enchord2016@ds029117.mongolab.com:29117/enchord');

exports.mongoose = mongoose.connection;