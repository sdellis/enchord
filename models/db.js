// Mongoose with mongolab
var mongoose = require('mongoose');
mongoose.connect('mongodb://jemah:enchord2016@ds029117.mongolab.com:29117/enchord');
//mongoose.connect('mongodb://jemah_local:enchord2016@ds041387.mongolab.com:41387/enchord_local');

exports.mongoose = mongoose.connection;
