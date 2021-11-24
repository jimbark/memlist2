// Passport facebook strategy module

// the study identifer, remove when stored in a single place, or using environment variable
var studyID = "mt_pilot_b4";
var sh = require('shorthash');

var User = require('./userdb.js');     // module with all dynamodb methods to access userDb
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy = require('passport-local').Strategy;

// prepare multi-lingual/project flash messages
var messages = {
    p1000_001: {
	message1: "You must enter a participation code.",
	message2: "Participation code not recognised. Please check code is correct."
	},
    p1000_002: {
	message1: "You must enter a participation code. p1000_002",
	message2: "Participation code not recognised. Please check code is correct. p1000_002"
	},
    p1000_003: {
	message1: "You must enter a participation code.",
	message2: "Participation code not recognised. Please check code is correct."
	},
    p1000_004: {
	message1: "You must enter a participation code.",
	message2: "Participation code not recognised. Please check code is correct."
	},
    p1000_005: {
	message1: "You must enter a participation code.",
	message2: "Participation code not recognised. Please check code is correct."
	},
    p1000_006: {
	message1: "You must enter a participation code.",
	message2: "Participation code not recognised. Please check code is correct."
	},
    p1000_007: {
	message1: "You must enter a participation code.",
	message2: "Participation code not recognised. Please check code is correct."
	},
    p1000_008: {
	message1: "You must enter a participation code.",
	message2: "Participation code not recognised. Please check code is correct."
	},
    p1000_009: {
	message1: "You must enter a participation code.",
	message2: "Participation code not recognised. Please check code is correct."
	},
    p1000_010: {
	message1: "Du må skrive inn en deltakerkode.",
	message2: "Deltakerkoden er ikke gjenkjent. Sjekk om koden er korrekt skrevet inn."
	},
    p1000_030: {
	message1: "Vous devez entrer un code de participation.",
	message2: "Code de participation non reconnu. Veuillez vérifier que le code est correct."
	},
    p1000_040: {
	message1: "Attenzione: inserire un codice di partecipazione.",
	message2: "Codice di partecipazione invalido. Controllare che il proprio codice sia corretto."
	},
    p1000_050: {
	message1: "Bir katılım kodu girmelisiniz.",
	message2: "Katılım kodu tanınmadı. Lütfen kodun doğruluğunu kontrol edin."
	},
    p1000_060: {
	message1: "Należy wprowadzić kod uczestnika.",
	message2: "Kod uczestnika nie został rozpoznany. Prosimy sprawdzić, czy kod jest prawidłowy."
	},
    p1000_070: {
	message1: "You must enter a participation code.",
	message2: "Participation code not recognised. Please check code is correct."
	},
    p1000_080: {
	message1: "Πρέπει να συμπληρώσεις τον κωδικό συμμετοχής.",
	message2: "Ο κωδικός συμμετοχής δεν αναγνωρίζετε. Παρακαλώ ελέγξτε εάν ο κωδικός είναι σωστός."
	},
    p1000_100: {
	message1: "You must enter a participation code.",
	message2: "Participation code not recognised. Please check code is correct."
	},
    p1001_001: {
	message1: "You must enter a participation code.",
	message2: "Participation code not recognised. Please check code is correct."
	},

    };


// function to check for an empty object
function isEmpty(obj) {
    for(var key in obj) {
	if(obj.hasOwnProperty(key))
	    return false;
    }
    return true;
}

// serialising the user into session = given the user object use callback to
// store authId in the session; callback is provided by passport, not me
passport.serializeUser(function(user, cb) {
  cb(null, user.authId);
});

// deserialising user from session = given the authId from session return the user object
// callback is provided by passport, not me
passport.deserializeUser(function(authId, cb) {
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

		passport.use('local', new LocalStrategy({
		    usernameField: 'username',
		    passwordField: 'password'
		    },
		    function(username, password, cb) {

			//console.log('Form (from querystring): ' + req.query.form);
			console.log('Participation code (from visible form field): ' + username);

			if (username !== "") {

			    // add ll-prefix to create authId
			    var authId = 'll-' + username;

			    User.findOrCreateById(authId, function (err, user) {
				return cb(err, user);
				});
			    }

			else {
			    console.log('No participation code detected');
			    return cb(null, false, {message: 'No participation code provided.'});
			}

		    }
		));

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

		// handle login request via submit button

		/*
		app.post('/login', passport.authenticate('local', { successRedirect: '/',
							 failureRedirect: '/login',
							 failureFlash: true })
		);
		*/

		app.post('/login', function(req, res, next) {

		    console.log('Form (from querystring): ' + req.query.form);
		    console.log('Participation code (from visible form field): ' + req.body.username);

		    if (req.body.username == "") {
			console.log('No participation code detected');

			res.locals.flash = {
			    type: 'danger',
			    intro: '',
			    message: messages[req.session.project.name].message1
			    //message: 'You must enter a participation code.',
			};

			// generate a unique code by hashing the date
     			var codeDate = new Date();
			codeDate.setTime(Date.now());
			textDate = JSON.stringify(codeDate);
			var mturkCode = sh.unique(textDate);

			//return res.render('localLogin', {mturkCode: mturkCode});
			return res.render('login', {mturkCode: mturkCode});

		    }

		    if (req.body.username == req.body.code) {
			console.log('Code entered matches the hidden code on login form.');

			passport.authenticate('local', { successRedirect: '/learn',
							 failureRedirect: '/login',
							 failureFlash: true })(req, res, next);
		    }

		    else {
			console.log('Code entered is not zero and not the hidden code... check if it is in database...');

			// check if code is in use, if not then send 'code not recognised' message
			// otherwise log the user in

			// add ll-prefix to create authId
			var authId = 'll-' + req.body.username;

			User.findById(authId, function (err, user) {
			    if (err) {
				console.log('Error accessing user database');
				return res.redirect(303, '/login');
			    }

			    if (isEmpty(user)) {
				console.log('User not found in database');

				res.locals.flash = {
				    type: 'danger',
				    intro: '',
				    message: messages[req.session.project.name].message2
				    //message: 'Participation code not recognised. Please check code is correct.'
				};

				//return res.redirect(303, '/login');

				// generate a unique code by hashing the date
				var codeDate = new Date();
				codeDate.setTime(Date.now());
				textDate = JSON.stringify(codeDate);
				var mturkCode = sh.unique(textDate);

				//return res.render('localLogin', {mturkCode: mturkCode});
				return res.render('login', {mturkCode: mturkCode});

			    }

			    passport.authenticate('local', { successRedirect: '/learn',
							     failureRedirect: '/login',
							     failureFlash: true })(req, res, next);

			});

		    }

		});
	    },
	};
};
