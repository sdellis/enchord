// Mongoose with mongolab
var mongoose = require('mongoose');
mongoose.connect('mongodb://jemah:enchord2016@ds029117.mongolab.com:29117/enchord');
//mongoose.connect('mongodb://jemah_live:enchord2016@ds041377.mongolab.com:41377/enchord_live');

exports.mongoose = mongoose.connection;