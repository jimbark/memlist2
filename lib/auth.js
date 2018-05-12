// Passport facebook strategy module

// the study identifer, remove when stored in a single place, or using environment variable
var studyID = "mt_pilot_b2";

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
		    callbackURL: config.facebook[env].callbackURL,
		    //callbackURL: 'http://www.vekori.com:3000/auth/facebook/callback/',
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
			//callbackURL: '/auth/facebook/callback?redirect=' + encodeURIComponent(req.query.redirect),
			callbackURL: '/auth/facebook/callback/',
		    })(req, res, next);
		});
		app.get('/auth/facebook/callback', passport.authenticate('facebook',
			{ failureRedirect: options.failureRedirect }),
			function(req, res){
			    // we only get here on successful authentication
			    var redirectUrl;
			    if (req.session.redirect) {
				redirectUrl = req.session.redirect;
				delete req.session.redirect;
			    }

			    // get the user ID
			    var authId = req.session.passport.user;

			    // debug - wait 5 secs for dynamodb entry to be available
			    // put a debugger breakpoint here, wait 5 secs, then continue

			    // check 'study' field to control repeat participants
			    User.findById(authId, function (err, user) {
				if (err) {
				    console.log('Error when trying to find user record in database');
				    return res.redirect(303, '/login');
				}
				else if (Object.keys(user).length === 0) {
				    console.log('Unable to find user record in database');
				    return res.redirect(303, '/login');
				}
				// get the study value and check if s1 field absent or from a previous study
				//else if (!user.study.s1 || user.study.s1 !== 'mt_pilot1_b2') {
				else if (!user.study.s1 || user.study.s1 !== studyID) {
				    req.session.destroy(function (err) {
					return res.redirect(303, '/pastParticipant');
				    });
				}
				// get the study value and proceed if they have not participated before
				//else if (user.study.s1 === 'mt_pilot1_b2') {
				else if (user.study.s1 === studyID) {
				    return res.redirect(303, redirectUrl || options.successRedirect);
				}
				else {
				    // if any other status display 500 error page
				    return res.render('500');
				}

			    //res.redirect(303, req.query.redirect || options.successRedirect);
			    //res.redirect(303, redirectUrl || options.successRedirect);
			    });

			}
		);
	    },

	};
};
