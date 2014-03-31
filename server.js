
/**
 * Module dependencies.
 */

var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var db = require('./models/db');
var passport = require('passport');
var flash = require('connect-flash');
var path = require('path');

var MongoStore = require('connect-mongo')(express);

require('./config/passport')(passport);

// all environments
//app.set('port', process.env.PORT || 3000);
app.configure(function() {
	app.use(express.logger('dev'));
	app.use(express.cookieParser());
	app.use(express.bodyParser());

	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'ejs');
	app.use(express.favicon());

	app.use(express.session({
		secret: 'enchord',
		/*store: new MongoStore({
			mongoose_connection: db
		})*/
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());
});

//app.use(express.json());
//app.use(express.urlencoded());
//app.use(express.methodOverride());
	
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

require('./routes/routes')(app, passport, db);

app.listen(port);
console.log('listenting on port ' + port);
