
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var db = require('./models/db');
var MongoStore = require('connect-mongo')(express);

var passport = require('./auth.js');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.cookieParser());
app.use(express.session({
	secret: 'keyboard cat',
	/*store: new MongoStore({
		mongoose_connection: db
	})*/
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

db.mongoose.once('open', function callback() {
	app.get('/', routes.index);
	app.get('/users', user.list);

	app.post('/login', passport.authenticate('local', { successRedirect: '#/', failureReirect: '#/login'}));
	app.post('/signup', routes.signup);
	app.get('/loggedin', function(req, res) {
		res.send(req.isAuthenticated() ? req.user : '0');
	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
