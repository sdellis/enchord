// Mongoose with mongolab
var mongoose = require('mongoose');

/* live db */
//mongoose.connect('mongodb://jemah:enchord2016@ds029117.mongolab.com:29117/enchord');

/* local testing db */
mongoose.connect('mongodb://jemah_local:enchord2016@ds041387.mongolab.com:41387/enchord_local');

exports.mongoose = mongoose.connection;
