
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
app.use(express.bodyParser());
app.use(express.session({
	secret: 'keyboard cat',
	/*store: new MongoStore({
		mongoose_connection: db
	})*/
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

db.mongoose.once('open', function callback() {
	app.get('/', routes.index);
	app.get('/users', user.list);
	
	app.get('/about', function(req, res){res.render('about.ejs', {title:"enchord"})});

	app.get('/login', function(req, res){res.render('login.ejs', {title:"enchord"})});
	app.post('/login', 
		passport.authenticate('local-login', 
			{successRedirect: '/members', 
			failureReirect: '/login'
		}));
	app.get('/signup', function(req, res){res.render('signup.ejs', {title:"enchord"})});
	app.post('/signup', routes.signup); // change to passport
	app.get('/members', isLoggedIn, function(req, res) {res.render('profile.ejs', {title:"Members"})});

	// add logout
	// add password recovery
	//app.get('/logout', routes.logout);
});

// Middleware to verify if logged in
function isLoggedIn(req, res, next){
	if (req.isAuthenticated())
		return next();
	res.redirect('/login');
}
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
