/* necessary tokens to connect our application to social platforms for login */
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '650161668383558', 
		'clientSecret' 	: '8a71020603f6b6c983af4f1a49607598', 
		'callbackURL' 	: 'http://www.enchord.me/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: 'taepcFeYyOSDA5T5NMw7qgqnC',
		'consumerSecret' 	: 'JQJ7odBqjjmXdUs8OItB4Uep1PwyzixNHrsI11lLYG4b0gVpdV',
		'callbackURL' 		: 'http://www.enchord.me/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: '1082883114760-8rb8bv5tc4m13a0p0rh4g26t3e91gj9o.apps.googleusercontent.com',
		'clientSecret' 	: 'u4YKYAyWueWB9WDry3oRgdvC',
		'callbackURL' 	: 'http://www.enchord.me/auth/google/callback'
	}

};