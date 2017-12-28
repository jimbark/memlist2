// Passport facebook strategy module

var User = require('./userdb.js');     // module with all dynamodb methods to access userDb
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

// serialising the user into session = given the user object return the authId
passport.serializeUser(function(user, cb) {
  cb(null, user.authId);
});

// deserialising user from session = given the authId from session return the user object
passport.deserializeUser(function(authId, cd) {
  User.findById(authId, function (err, user) {
    cb(err, user);
  });
});
/* OR
passport.deserializeUser(function(authId, cb){
	User.findById(authId, function(err, user){
		if(err || !user) return cb(err, null);
		cb(null, user);
	});
});
*/

// export a function that returns and object containing our methods, allows you to feed in config options
module.exports = function(app, options){

	// if success and failure redirects aren't specified,
	// set some reasonable defaults
	if(!options.successRedirect)
		options.successRedirect = '/learn';
	if(!options.failureRedirect)
		options.failureRedirect = '/login';

	return {

	    init: function() {
		var env = app.get('env');
		var config = options.providers;

		// configure Facebook strategy
		passport.use(new FacebookStrategy({
		    clientID: config.facebook[env].appId,
		    clientSecret: config.facebook[env].appSecret,
		    callbackURL: 'http://www.vekori.com:3000/auth/facebook/callback/',
		    //callbackURL: '/auth/facebook/callback',
		}, function(accessToken, refreshToken, profile, cb){
		    //var authId = 'facebook:' + profile.id;
		    var authId = 'fb-' + profile.id;

		    /*
		     User.findOne({ authId: authId }, function(err, user){
			if(err) return cb(err, null);
			if(user) return cb(null, user);
			user = new User({
			    authId: authId,
			    name: profile.displayName,
			    created: Date.now(),
			    role: 'customer',
			});
			user.save(function(err){
			    if(err) return cb(err, null);
			    cb(null, user);
			});
		    });
		    */

		    /*User.findOrCreateById({ facebookId: profile.id }, function (err, user) {
			return cb(err, user);
		    });*/
		    /*User.findOrCreateById({ authId: authId }, function (err, user) {
			return cb(err, user);
		    });*/
		    User.findOrCreateById(authId, function (err, user) {
			return cb(err, user);
		    });




		}));

		app.use(passport.initialize());
		app.use(passport.session());
	    },


	    registerRoutes: function(){
		// register Facebook routes
		app.get('/auth/facebook', function(req, res, next){
		    passport.authenticate('facebook', {
			//callbackURL: '/auth/facebook/callback?redirect=' +
			//    encodeURIComponent(req.query.redirect),
			callbackURL: '/auth/facebook/callback/',
		    })(req, res, next);
		});
		app.get('/auth/facebook/callback', passport.authenticate('facebook',
			{ failureRedirect: options.failureRedirect }),
			function(req, res){
			    // we only get here on successful authentication
			    //res.redirect('/');
			    res.redirect(303, req.query.redirect || options.successRedirect);
			}
		);
	    },

	};
};
