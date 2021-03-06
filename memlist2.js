var express= require('express');

var app = express();

var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser  = require('body-parser');
var fs = require('fs');
var sh = require('shorthash');
var env = app.get('env');
var studyID = "study4_1";
var cluster = require('cluster');

var credentials = require('./credentials.js');

var User = require('./lib/userdb.js');     // module with all dynamodb methods to access userDb
var s3Store = require('./lib/s3lib.js');    // module with all methods to access S3

// setup authetication, providing configuration options
var auth = require('./lib/auth.js')(app, {
	providers: credentials.authProviders,
	successRedirect: '/learn',
	failureRedirect: '/login',
});

// setup logging
var log4js = require('log4js');

log4js.configure({
  appenders: {
    everything: { type: 'file', filename: __dirname + '/log/memlist.log', maxLogSize: 10485760, backups: 3},
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: [ 'everything' , 'console'], level: 'info'}
  }
});

var logger = log4js.getLogger();
logger.level = 'debug';

logger.debug("Some debug messages to prove working");
logger.info("Some info messages to prove working");
logger.error("Some error messages to prove working");

// setup Domains to handle uncaught exceptions
app.use(function(req, res, next){
    // create a domain for this request
    var domain = require('domain').create();
    // handle errors on this domain
    domain.on('error', function(err){
	logger.error('DOMAIN ERROR CAUGHT\n', err.stack);
	try {
	    // failsafe shutdown in 5 seconds
	    setTimeout(function(){
		logger.error('Failsafe shutdown.');
		process.exit(1);
	    }, 5000);

	    // disconnect from the cluster
	    var worker = require('cluster').worker;
	    if(worker) worker.disconnect();

	    // stop taking new requests; commented out as cannot access server created in another script?
	    //server.close();

	    try {
		// attempt to use Express error route
		next(err);
	    } catch(error){
		// if Express error route failed, try
		// plain Node response
		logger.error('Express error mechanism failed.\n', error.stack);
		res.statusCode = 500;
		res.setHeader('content-type', 'text/plain');
		res.end('Server error.');
	    }
	} catch(error){
	    logger.error('Unable to send 500 response.\n', error.stack);
	}
    });

    // add the request and response objects to the domain
    domain.add(req);
    domain.add(res);

    // execute the rest of the request chain in the domain
    domain.run(next);
});


// Setup http logging
var morgan = require('morgan');
var path = require('path');
var rfs = require('rotating-file-stream');

// ensure log directory exists
var logDirectory = path.join(__dirname, 'log');
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory);

// create a rotating write stream
var accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  size:     '10M', // rotate every 10 MegaBytes written
  path: logDirectory
});

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

// log worker use for clusters to check load-sharing
app.use(function(req,res,next){
    //var cluster = require('cluster');
    if(cluster.isWorker) console.log('Worker ' + cluster.worker.id);
    next();
});


// enable use of https
var https = require('https');

var caChain = credentials.https[env].ca;
console.log('caChain base array is: ' + caChain);
console.log(caChain);

for (var i = caChain.length; i > 0; i--) {
    var j = fs.readFileSync(__dirname + caChain[i-1]);
    caChain[i-1] = j;
}

console.log('caChain is: ' + caChain);

var httpsOptions = {
    key: fs.readFileSync(__dirname + credentials.https[env].key),
    cert: fs.readFileSync(__dirname + credentials.https[env].cert),
    ca: caChain
};

var HTTP_PORT  = 80;
var HTTPS_PORT = 443;

// create separate server just to perform http to http redirect
var http       = require('http');
var http_app = express();
http_app.set('port', HTTP_PORT);

http_app.all('/*', function(req, res, next) {
  if (/^http$/.test(req.protocol)) {
    //var host = req.headers.host.replace(/:[0-9]+$/g, ""); // strip the port # if any
    //if ((HTTPS_PORT != null) && HTTPS_PORT !== 443) {
    //  return res.redirect(301, "https://" + host + ":" + HTTPS_PORT + req.url);
    //} else {
    //return res.redirect(301, "https://" + host + req.url);
    if ((HTTPS_PORT != null) && HTTPS_PORT !== 443) {
      return res.redirect(301, "https://" + req.hostname + ":" + HTTPS_PORT + req.url);
    } else {
      return res.redirect(301, "https://" + req.hostname + req.url);
    }
  } else {
    return next();
  }
});

http.createServer(http_app).listen(HTTP_PORT).on('listening', function() {
  return console.log("HTTP to HTTPS redirect app launched.");
});

// auth.init() links in Passport middleware:
auth.init();

// set up handlebars view engine
var exphbs  = require('express-handlebars');
app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'main',
    helpers: {
	section: function(name, options){
	    if(!this._sections) this._sections = {};
	    this._sections[name] = options.fn(this);
	    return null;
	}
    }
}));
app.set('view engine', '.hbs');

app.set('port', process.env.PORT || HTTPS_PORT);

app.use(express.static(__dirname + '/public'));

// enable handling of secure cookies
app.use(cookieParser(credentials.cookieSecret));

// enable session store using Dynamodb
var options = {
    // Optional DynamoDB table name, defaults to 'sessions'
    table: 'myapp-sessions',

    // Optional path to AWS credentials and configuration file
    // AWSConfigPath: './path/to/credentials.json',

    // Optional JSON object of AWS credentials and configuration
    AWSConfigJSON: {
	accessKeyId: credentials.aws[env].accessKeyId,
	secretAccessKey: credentials.aws[env].secretAccessKey,
	region: 'eu-west-1'
    },

    // Optional client for alternate endpoint, such as DynamoDB Local
    //client: new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:8000')}),

    // Optional ProvisionedThroughput params, defaults to 5
    readCapacityUnits: 2,
    writeCapacityUnits: 2
};

var DynamoDBStore = require('connect-dynamodb')({session: expressSession});
//app.use(expressSession({store: new DynamoDBStore(options), secret: credentials.cookieSecret}));

app.use(expressSession({
    store: new DynamoDBStore(options),
    secret: credentials.cookieSecret,
    resave: false,
    saveUninitialized: true
}));

/*
//app.use(require('cookie-parser')(credentials.cookieSecret));
//app.use(require('express-session')());
// use session store running against MemoryStore
app.use(expressSession({
    secret: credentials.cookieSecret,
    resave: false,
    saveUninitialized: false,
}));
*/

// delete any old flash message
app.use(function(req, res, next){
    delete res.locals.flash;
    next();
});

// prepare multi-lingual/project flash messages
/*var messages = {
    p1000_001: {
	message1: "You must enter a participation code.",
	message2: "Participation code not recognised. Please check code is correct."
	},
    p1000_002: {
	message1: "You must enter a participation code. p1000_002",
	message2: "Participation code not recognised. Please check code is correct. p1000_002"
	},
    };
*/

// process url encoded body for POST requests
app.use(bodyParser.urlencoded({ extended: false }));

// use csurf for cross site request forgery protection
app.use(require('csurf')());
app.use(function(req, res, next){
	res.locals._csrfToken = req.csrfToken();
	next();
});

app.use(function(req, res, next){
    res.locals.showTests = app.get('env') !== 'production' &&
	req.query.test === '1';
    next();
});


// setup res.locals and req.session storage of the project
app.use(function(req, res, next){

    if (req.query.project) {
	req.session.project = { name: req.query.project };
    }

    res.locals.project = {};
    if (req.session.project) {
	res.locals.project[req.session.project.name] = 'cheese';
    }
    else {
	res.locals.project.p1000_001 = 'cheese';
    }

    if (req.session.project) {
	console.log('Session project state is: ' + req.session.project.name);
    }
    else {
	console.log('Session project state not set ');
    }

    next();
});


// setup res.locals content for the main layout to use
app.use(function(req, res, next){
    res.locals.copyrightYear = '2021';

    if (env === 'production') {
	res.locals.secureSeal = ('<span id="siteseal"><script async type="text/javascript" src="https://seal.godaddy.com/getSeal?sealID=kHYQLI7RQKLF1a0LwlCl250qpaI4MxJV1FuVnNgSmXzxO0ANBqmy0Gaghqbf"></script></span>');
    }
    else {
	var projName = " ";
	if(req.session.project) {
	    projName = req.session.project.name;
	}
	res.locals.secureSeal = '<span>DevSeal </span>' + '<span>' + projName + '</span>';
    }

    if(!req.session || !req.session.passport || !req.session.passport.user ) {
	res.locals.logNav = 'Logged out';
	//res.locals.logNav = '<a class="nav-link" href="/login">Login</a>';
	//res.locals.logNav = '<a class="nav-link" href="/auth/facebook">Login</a>';
    }
    else {
	if (res.locals.logNav) {
	    delete res.locals.logNav;
	}
    }

    next();
});


// redirect all www to non-www
app.get('/*', function(req, res, next) {
    if (req.headers.host.match(/^www/) !== null ) return res.redirect(301, 'https://' + req.headers.host.replace(/^www\./, '') + req.url);
    else next();
});

// route used to generate unhandled exception to test domain mechanism
//app.get('/epic-fail', function(req, res){
//    process.nextTick(function(){
//	throw new Error('Kaboom!');
//    });
//});


// Test route to check multi-project templating
app.get('/projtest', function(req, res){
    res.render('projtest');
});

// and routes to allow direct access to a specific project
app.get('/ukschools', function(req, res){
    res.locals.project = { p1000_003: 'cheese' };
    req.session.project = { name: "p1000_003" };
    return res.redirect(303, '/?project=p1000_003');
});
app.get('/memory', function(req, res){
    res.locals.project = { p1000_004: 'cheese' };
    req.session.project = { name: "p1000_004" };
    return res.redirect(303, '/?project=p1000_004');
});
app.get('/greenwich', function(req, res){
    res.locals.project = { p1000_005: 'cheese' };
    req.session.project = { name: "p1000_005" };
    return res.redirect(303, '/?project=p1000_005');
});
app.get('/norsk', function(req, res){
    res.locals.project = { p1000_010: 'cheese' };
    req.session.project = { name: "p1000_010" };
    return res.redirect(303, '/?project=p1000_010');
});
app.get('/indian', function(req, res){
    res.locals.project = { p1000_020: 'cheese' };
    req.session.project = { name: "p1000_020" };
    return res.redirect(303, '/?project=p1000_020');
});
app.get('/fr', function(req, res){
    res.locals.project = { p1000_030: 'cheese' };
    req.session.project = { name: "p1000_030" };
    return res.redirect(303, '/?project=p1000_030');
});
app.get('/it', function(req, res){
    res.locals.project = { p1000_040: 'cheese' };
    req.session.project = { name: "p1000_040" };
    return res.redirect(303, '/?project=p1000_040');
});
app.get('/tr', function(req, res){
    res.locals.project = { p1000_050: 'cheese' };
    req.session.project = { name: "p1000_050" };
    return res.redirect(303, '/?project=p1000_050');
});
app.get('/pl', function(req, res){
    res.locals.project = { p1000_060: 'cheese' };
    req.session.project = { name: "p1000_060" };
    return res.redirect(303, '/?project=p1000_060');
});
app.get('/uk_sports', function(req, res){
    res.locals.project = { p1000_070: 'cheese' };
    req.session.project = { name: "p1000_070" };
    return res.redirect(303, '/?project=p1000_070');
});
app.get('/gr', function(req, res){
    res.locals.project = { p1000_080: 'cheese' };
    req.session.project = { name: "p1000_080" };
    return res.redirect(303, '/?project=p1000_080');
});


// test pages for reviewign text options
app.get('/home_test1', function(req, res){
    logger.info("Info level log for home page to prove working");
    //res.clearCookie("signed_monster");
    res.render('home_test1');
});
app.get('/home_test2', function(req, res){
    logger.info("Info level log for home page to prove working");
    //res.clearCookie("signed_monster");
    res.render('home_test2');
});
app.get('/instructions_test1', function(req, res){
    logger.info("Info level log for home page to prove working");
    //res.clearCookie("signed_monster");
    res.render('instructions_test1');
});


// example of clearing a cookie
app.get('/', function(req, res){
    logger.info("Info level log for home page to prove working");
    //res.clearCookie("signed_monster");
    res.render('home');
});

// exmaple of reading a cookie from a request
app.get('/about', function(req, res){
    //var signedMonster = req.signedCookies.signed_monster;
    //console.log(signedMonster);
    res.render('about', {pageTestScript: '/qa/tests-about.js'});
});

app.get('/FAQ', function(req, res){
    res.render('faq');
});

app.get('/privacy', function(req, res){
    res.render('privacy');
});

// make use of authentication when start study, with cookie setting exmaple
app.get('/learn', function(req, res){

    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');

    //res.cookie('signed_monster', 'nom nom', { signed: true });

    // set a flash message
    /* res.locals.flash = {
	    type: 'success',
	    intro: 'Thank you!',
	    message: 'You are logged in and can start learning.',
	};
    */

    // get the user ID
    var authId = req.session.passport.user;

    User.findById(authId, function (err, user) {
	if (err) {
	    console.log('Error when trying to find user record in database');
	    return res.redirect(303, '/login');
	}
	else if (Object.keys(user).length === 0) {
	    console.log('Unable to find user record in database');
	    return res.redirect(303, '/login');
	}

	// if project stored in userdb then set session state to match
	if (user.project!== 'default') {
	    req.session.project = { name: user.project };
	    res.locals.project = {};
	    res.locals.project[req.session.project.name] = 'cheese';
	    console.log('Updated session state with value from userdb');

	    // if new user get their consent to participate
	    if (user.status == 'new') {
		res.render('consent');
	    }
	    else if (user.status == 'consented'){
		// if consented display demographics regsiter page
		res.render('register');
	    }
	    else if (user.status == 'registered'){
		// if registered display demo page
		res.render('demo');
	    }
	    else if (user.status == 'learnt'){
		// if returning participant display 30min test page
		res.render('delayed', {hr24TestTime: user.hour24});
	    }
	    else if (user.status == 'demoed'){
		// if demo has been completed display learn page
		res.render('learn');
	    }
	    else if (user.status == 'delayed1'){
		// if 30min test has been completed display 24 hour test page
		res.render('delayed2', {mechTurkID: user.mturkID});
	    }
	    else if (user.status == 'complete'){
		// if demo has been completed display learn page
		res.render('end');
	    }
	    else if (user.status == 'withdrawn'){
		// if demo has been completed display learn page
		res.render('withdrawn');
	    }
	    else {
		// if any other status display 500 error page
		res.render('500');
	    }
	}

	// else store session project state in userdb

	else {

	    var updates = {
		TableName: 'userDb',
		Key: {'authId' : {S: authId}},
		ExpressionAttributeNames: {
		    "#A": 'project'
		},
		ExpressionAttributeValues: {
		    ":a": { S: req.session.project.name }
		},
		ReturnValues: "ALL_NEW",
		UpdateExpression: "SET #A = :a"
	    };

	    User.updateById(authId, updates, function (err, data) {
		if (err) {
		    console.log('Unable to update user project  in database');
		    return res.redirect(303, '/login');
		}
		// if update successful log to console and move to relevant next page
		console.log('Updated user project in database');

		// if new user get their consent to participate
		if (user.status == 'new') {
		    res.render('consent');
		}
		else if (user.status == 'consented'){
		    // if consented display demographics regsiter page
		    res.render('register');
		}
		else if (user.status == 'registered'){
		    // if registered display demo page
		    res.render('demo');
		}
		else if (user.status == 'learnt'){
		    // if returning participant display 30min test page
		    res.render('delayed', {hr24TestTime: user.hour24});
		}
		else if (user.status == 'demoed'){
		    // if demo has been completed display learn page
		    res.render('learn');
		}
		else if (user.status == 'delayed1'){
		    // if 30min test has been completed display 24 hour test page
		    res.render('delayed2', {mechTurkID: user.mturkID});
		}
		else if (user.status == 'complete'){
		    // if demo has been completed display learn page
		    res.render('end');
		}
		else if (user.status == 'withdrawn'){
		    // if demo has been completed display learn page
		    res.render('withdrawn');
		}
		else {
		    // if any other status display 500 error page
		    res.render('500');
		}

	    });
	}
    });
});


// display login page
app.get('/login', function(req, res){

    // generate a unique code by hashing the date
    var codeDate = new Date();
    codeDate.setTime(Date.now());
    textDate = JSON.stringify(codeDate);
    var mturkCode = sh.unique(textDate);

    res.render('login', {mturkCode: mturkCode});
});



/*

// handle login request via submit button - no longer needed as in auth.init injected routes
app.post('/login', function(req, res){

    console.log('Form (from querystring): ' + req.query.form);

    console.log('Participation code (from visible form field): ' + req.body.username);

    // get the users particupation code
    var authId = req.body.username;

    if (authId !== "") {

	passport.authenticate('local', { successRedirect: '/',
				   failureRedirect: '/login',
				   failureFlash: true });
    }

    else {
	console.log('No participation code detected');
	res.render('localLogin');
    }
});

*/


// specify our auth routes:
auth.registerRoutes();

/*
// display MTurk local login page
app.get('/localLogin', function(req, res){

    // generate a unique code by hashing the date
    var codeDate = new Date();
    codeDate.setTime(Date.now());
    textDate = JSON.stringify(codeDate);
    var mturkCode = sh.unique(textDate);

    res.render('localLogin', {mturkCode: mturkCode});

});
*/

app.get('/consent', function(req, res){
    // check user is logged in
    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');
    res.render('consent');
});

app.get('/withdrawn', function(req, res){
    res.render('withdrawn');
});

app.get('/register', function(req, res){
    // check user is logged in
    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');
    res.render('register');
});

app.post('/register', function(req, res){

    console.log('Form (from querystring): ' + req.query.form);
    //console.log('CSRF token (from hidden form field): ' + req.body._csrf);
    console.log('Checkbox status (from visible form field): ' + req.body.consented);

    // check user is logged in
    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');

    // get the user id
    var authId = req.session.passport.user;

    if (req.body.consented == "on") {

	var updates = {
	    TableName: 'userDb',
	    Key: {'authId' : {S: authId}},
	    ExpressionAttributeNames: {
		"#A": 'status'
	    },
	    ExpressionAttributeValues: {
		":a": { S: 'consented'}
	    },
	    ReturnValues: "ALL_NEW",
	    UpdateExpression: "SET #A = :a"
	};

	User.updateById(authId, updates, function (err, data) {
	    if (err) {
		console.log('Unable to update user consent in database');
		return res.redirect(303, '/consent');
	    }
	    // if update successful log data to console and move to
	    console.log('Updated user consent in database');
	    res.render('register');
	    //return res.redirect(303, '/register');
	});
    }
    else {
	 console.log('Consent not detected');
    }
});

app.get('/withdraw', function(req, res){
    // check user is logged in
//    if(!req.session.passport) return res.redirect(303, '/auth/facebook');
//    if(!req.session.passport.user) return res.redirect(303, '/auth/facebook');

    if(!req.session.passport || !req.session.passport.user) {
	req.session.redirect = "https://" + req.headers.host + '/withdraw';
	//return res.redirect(303, '/auth/facebook');
	return res.redirect(303, '/login');
    }
    res.render('withdraw');
});

app.post('/withdraw', function(req, res){

    console.log('Form (from querystring): ' + req.query.form);
    //console.log('CSRF token (from hidden form field): ' + req.body._csrf);

    // check user is logged in
    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');

    // get the user id
    var authId = req.session.passport.user;

    // first get the existing user object
    User.findById(authId, function (err, user) {
	if (err) {
	    console.log('Unable to find user record in database');
	    return res.redirect(303, '/login');
	}

	// if got the user update values
	var myDate = new Date();
	myDate.setTime(Date.now());
	myDate = JSON.stringify(myDate);
	myDate = myDate.replace(/\"/g,"");
	myDate = myDate.replace(/:/g,"-");
	myDate = myDate.replace(/\./g,"-");

	user.authId = 'wd-' + user.authId + "-" + myDate;
	user.status = 'withdrawn';

	// save updated record as new record
	User.createById('wdUserDb', user, function (err,data) {
	    if (err) {
		console.log('Unable create withdraw entry in database');
		return res.redirect(303, '/consent');
	    }
	    // if update successful log data to console
	    console.log('Consent withdrawn record created in database');

	    // update status of old record to withdrawn
	    // build params object for the userdb update
	    var updates = {
		TableName: 'userDb',
		Key: {
		    'authId' : {S: authId},
		},
		ExpressionAttributeNames: {
		    "#D": 'status',
		},
		ExpressionAttributeValues: {
		    ":d": { S: 'withdrawn'},
		},
		ReturnValues: "ALL_NEW",
		UpdateExpression: "SET #D = :d"
	    };

	    User.updateById(authId, updates, function (err, data) {
		if (err) {
		    console.log('Unable to update user status in database to withdrawn');
		    return res.render('500');
		}
		// if update successful log data to console and move to withdrawn page
		console.log('Updated user status to withdrawn in database');
		//return res.redirect(303, '/withdrawn');
		var withdrawnUrl = "/withdrawn?project=" + req.session.project.name;
		console.log('Redirecting to withdrawn url:' + withdrawnUrl);
		req.session.destroy(function (err) {
		    //Inside a callback… bulletproof!
		    return res.redirect(303, withdrawnUrl);
		    //return res.redirect(303, '/withdrawn');
		});

	    });
	});
    });
});

app.post('/demographics', function(req, res){

    // create all demographics variables for storage in userdb
    // check for presence of fields so that different projects can have different questions

    var inAge = 0;
    if (req.body.age) {
	inAge = req.body.age;
	console.log('Age(from visible form field): ' + req.body.age);
	}

    var inGender = "null";
    if (req.body.gender) {
	inGender = req.body.gender;
	console.log('Gender(from visible form field): ' + req.body.gender);
	}

    var inEducation = "null";
    if (req.body.education) {
	inEducation = req.body.education;
	console.log('Education (from visible form field): ' + req.body.education);
	}

    var inEnglish = "null";
    if (req.body.english) {
	inEnglish = req.body.english;
	console.log('English standard (from visible form field): ' + req.body.english);
	}

    var inNationality = "null";
    if (req.body.nationality) {
	inNationality = req.body.nationality;
	console.log('Nationality (from visible form field): ' + req.body.nationality);
	}

    var inSpoken = "null";
    if (req.body.spoken) {
	inSpoken = req.body.spoken;
	console.log('Spoken English standard (from visible form field): ' + req.body.spoken);
	}

    var inMedical = "null";
    if (req.body.medical) {
	inMedical = req.body.medical;
	console.log('Medical (from visible form field): ' + req.body.medical);
	}

    var inDyslexia = "null";
    if (req.body.dyslexia) {
	inDyslexia = req.body.dyslexia;
	console.log('Dyslexia (from visible form field): ' + req.body.dyslexia);
	}

    var inProblems = "null";
    if (req.body.problems) {
	inProblems = req.body.problems;
	console.log('Problems (from visible form field): ' + req.body.problems);
	}

    var inOthersComparison = "null";
    if (req.body.othersComparison) {
	inOthersComparison = req.body.othersComparison;
	console.log('OthersComparison (from visible form field): ' + req.body.othersComparison);
	}

    var inSelfComparison = "null";
    if (req.body.selfComparison) {
	inSelfComparison = req.body.selfComparison;
	console.log('SelfComparison (from visible form field): ' + req.body.selfComparison);
	}

    var inConversation = "null";
    if (req.body.conversation) {
	inConversation = req.body.conversation;
	console.log('Conversation (from visible form field): ' + req.body.conversation);
	}

    var inRating = "99";
    if (req.body.rating) {
	inRating = req.body.rating;
	console.log('Rating (from visible form field): ' + req.body.rating);
	}

    var inPreferred = "null";
    if (req.body.preferred) {
	inPreferred = req.body.preferred;
	console.log('Preferred (from visible form field): ' + req.body.preferred);
	}

    var inResidence = "null";
    if (req.body.residence) {
	inResidence = req.body.residence;
	console.log('Residence (from visible form field): ' + req.body.residence);
	}

    var inSource = "null";
    if (req.body.source) {
	inSource = req.body.source;
	console.log('Source (from visible form field): ' + req.body.source);
	}

    var inNeuro = "null";
    if (req.body.neuro) {
	inNeuro = req.body.neuro;
	console.log('Neuro (from visible form field): ' + req.body.neuro);
	}

    var inSport = "null";
    if (req.body.sport) {
	inSport = req.body.sport;
	console.log('Sport (from visible form field): ' + req.body.sport);
	}

    var inSportAge = "null";
    if (req.body.sportage) {
	inSportAge = req.body.sportage;
	console.log('SportAge (from visible form field): ' + req.body.sportage);
	}

    var inSportOften = "null";
    if (req.body.sportoften) {
	inSportOften = req.body.sportoften;
	console.log('SportOften (from visible form field): ' + req.body.sportoften);
	}

    var inInjury = "null";
    if (req.body.injury) {
	inInjury = req.body.injury;
	console.log('Injury (from visible form field): ' + req.body.injury);
	}

    var inLoss = "null";
    if (req.body.loss) {
	inLoss = req.body.loss;
	console.log('Loss (from visible form field): ' + req.body.loss);
	}

    console.log('Form (from querystring): ' + req.query.form);
    //console.log('CSRF token (from hidden form field): ' + req.body._csrf);

    // check user is logged in
    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');

    // get the user id
    var authId = req.session.passport.user;

    // build the string for mturkID
    var mturkRaw = authId + studyID;
    var mturkID = sh.unique(mturkRaw);

    // build params object for the userdb update
    var updates = {
	TableName: 'userDb',
	Key: {
	    'authId' : {S: authId},
	},
	ExpressionAttributeNames: {
	    "#B": 'gender',
	    "#C": 'age',
	    "#D": 'status',
	    "#E": 'education',
	    "#F": 'english',
	    "#G": 'nationality',
	    "#H": 'mturkID',

	    "#I": 'spoken',
	    "#J": 'medical',
	    "#K": 'dyslexia',
	    "#L": 'problems',
	    "#M": 'othersComparison',
	    "#N": 'selfComparison',
	    "#O": 'conversation',
	    "#P": 'rating',
	    "#Q": 'preferred',
	    "#R": 'residence',
	    "#S": 'source',
	    "#T": 'neuro',

	    "#U": 'sport',
	    "#V": 'sportage',
	    "#W": 'sportoften',
	    "#X": 'injury',
	    "#Y": 'loss',

	},
	ExpressionAttributeValues: {
	    ":b": { S: inGender},
	    ":c": { N: inAge},
	    ":d": { S: 'registered'},
	    ":e": { S: inEducation},
	    ":f": { S: inEnglish},
	    ":g": { S: inNationality},
	    ":h": { S: mturkID},

	    ":i": {S: inSpoken},
	    ":j": {S: inMedical},
	    ":k": {S: inDyslexia},
	    ":l": {S: inProblems},
	    ":m": {S: inOthersComparison},
	    ":n": {S: inSelfComparison},
	    ":o": {S: inConversation},
	    ":p": {N: inRating},
	    ":q": {S: inPreferred},
	    ":r": {S: inResidence},
	    ":s": {S: inSource},
	    ":t": {S: inNeuro},

	    ":u": {S: inSport},
	    ":v": {S: inSportAge},
	    ":w": {S: inSportOften},
	    ":x": {S: inInjury},
	    ":y": {S: inLoss},

	},
	ReturnValues: "ALL_NEW",
	UpdateExpression: "SET #B = :b,#C = :c,#D = :d,#E = :e,#F = :f,#G = :g,#H = :h,#I = :i,#J = :j,#K = :k,#L = :l,#M = :m,#N = :n,#O = :o,#P = :p,#Q = :q,#R = :r,#S = :s,#T = :t,#U = :u,#V = :v,#W = :w,#X = :x,#Y = :y"
    };

    User.updateById(authId, updates, function (err, data) {
	if (err) {
	    console.log('Unable to update user email address in database');
	    return res.redirect(303, '/register');
	}
	// if update successful log data to console and move to
	console.log('Updated user email address in database');
	return res.redirect(303, '/instructions');
    });
});


app.get('/instructions', function(req, res){
    // check user is logged in
    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');
    res.render('instructions');
});


// display demo page
app.get('/demo', function(req, res){
    // check user is logged in
    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');
    res.render('demo');
});

// display post study phase instructions page
app.get('/postInstructions', function(req, res){
    // check user is logged in
    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');

    // get the user ID
    var authId = req.session.passport.user;

    User.findById(authId, function (err, user) {
	if (err) {
	    console.log('Unable to find user record in database');
	    return res.redirect(303, '/login');
	}
	else {
	    // render post study instructions with 30min test time
	    res.render('postInstructions', {min30TestTime: user.min30});
	}
    });
});

// display delayed test page
app.get('/delayed', function(req, res){

    // check user is logged in
    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');

    // get the user ID
    var authId = req.session.passport.user;

    User.findById(authId, function (err, user) {
	if (err) {
	    console.log('Unable to find user record in database');
	    return res.redirect(303, '/login');
	}
	// if new user get their consent to participate
	if (user.status == 'new') {
	    res.render('consent');
	}
	else if (user.status == 'consented'){
	    // if consented display demographics regsiter page
	    res.render('register');
	}
	else if (user.status == 'registered'){
	    // if registered display demo page
	    res.render('demo');
	}
	else if (user.status == 'demoed'){
	    // if demo has been completed display learn page
	    res.render('learn');
	}
	else if (user.status == 'learnt'){
	    // if returning participant display 30min test page
	    res.render('delayed', {hr24TestTime: user.hour24});
	}
	else if (user.status == 'delayed1'){
	    // if 30min test has been completed display 24 hour test page
	    res.render('delayed2', {mechTurkID: user.mturkID});
	}
	else if (user.status == 'complete'){
	    // if all stages have been completed display 'end' page
	    res.render('end');
	}
	else if (user.status == 'withdrawn'){
	    // if demo has been completed display learn page
	    res.render('withdrawn');
	}
	else {
	    // if any other status display 500 error page
	    res.render('500');
	}
    });

});

// display post delayed test instructions
app.get('/postDelayedInstructions', function(req, res){
    // check user is logged in
    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');
    res.render('postDelayedInstructions');
});

// display explanation about only accepting new participants
app.get('/pastParticipant', function(req, res){
    // code logs user out before redirecting here, so do not check for logged in status
    res.render('pastParticipant');
});

// version of route that saves study data to S3
app.post('/studySave', function(req, res){
    if(req.xhr || req.accepts('json,html')==='json'){
	console.log('Valid POST request to save study session data ');
	console.log(req.body.message);
	console.log('here are the common stringified objects:');
	console.log(req.body.lists);
	console.log(req.body.testType);

	var lists = JSON.parse(req.body.lists);
	var startDate = JSON.parse(req.body.startDate);
	var endDate = JSON.parse(req.body.endDate);
	var duration = JSON.parse(req.body.duration);

	console.log('here are the common unstringified objects:');
	console.log(lists);
	console.log(startDate);
	console.log(endDate);
	console.log(duration);

	var times = [startDate, endDate, duration];
	lists.push(times);  // add timing data

	if ((req.body.testType === 'demo') || (req.body.testType === 'study')) {

	    console.log('here are the study phase additional stringified objects:');
	    console.log(req.body.clists);
	    console.log(req.body.timedOut);

	    var clists = JSON.parse(req.body.clists);
	    var timedOut = JSON.parse(req.body.timedOut);

	    console.log(clists);
	    console.log(timedOut);
	    //console.log(clists[0][0]);
	    console.log(clists[1][0]);
	    //console.log(clists[1][0][0]);

	    lists.push(timedOut);  // add study time expiry flag
	    lists.push(clists);  //  add the complete data with unlearned lists too

	    }

	if ((req.body.testType === 'delayed') || (req.body.testType === 'delayed2')) {

	    console.log('here are the study phase additional stringified objects:');
	    console.log(req.body.tlists);

	    var tlists = JSON.parse(req.body.tlists);

	    console.log(tlists);
	    console.log(tlists[2][0]);

	    lists.push(tlists);  //  add the test lists with the full answers data too

	    }

	var stringifiedLists = JSON.stringify(lists);  // stringifiedLists = JSON.stringify(lists);
	console.log('here is the full stringified data object:');
	console.log(stringifiedLists);

	var dataDir = __dirname + '/data';

	// check user is logged in
	if(!req.session.passport) return res.redirect(303, '/login');
	if(!req.session.passport.user) return res.redirect(303, '/login');

	// get the user id
	var authId = req.session.passport.user;

	var bucket = 'tmcgbucket1';
	var studyFile = authId + "/" + req.body.testType + "-" + req.body.startDate.replace(/\"/g,"");
	studyFile = studyFile.replace(/:/g,"-");
	studyFile = studyFile.replace(/\./g,"-");

	s3Store.s3Upload(bucket, studyFile, stringifiedLists, function (err,data) {
	    if (err) {
		console.log('error saving file to S3');
		res.send({success: true, message: 'valid POST received but error saving file'});
		throw err;

	    } else {
		console.log("File named " + studyFile + " saved to S3!");
		//res.send({success: true, message: 'Study file successfully saved!'});

		// status change to dynamically use testType to set demoed or learnt
		var reqStatus = req.body.testType;
		var status = "";
		if (reqStatus == "demo") {
		    status = "demoed";
		    }
		if (reqStatus == "study") {
		    status = "learnt";
		    }
		if (reqStatus == "delayed") {
		    status = "delayed1";
		    }
		if (reqStatus == "delayed2") {
		    status = "complete";
		    }

		// get the user id
		var authId = req.session.passport.user;
		var updates;

		if (status == "learnt"){

		    // build params object for the userdb update with 30min and 24hr test times
		    updates = {
			TableName: 'userDb',
			Key: {
			    'authId' : {S: authId},
			},
			ExpressionAttributeNames: {
			    "#A": 'status',
			    "#B": 'min30',
			    "#C": 'hour24',
			},
			ExpressionAttributeValues: {
			    ":a": { S: status},
			    ":b": { S: req.body.t30},
			    ":c": { S: req.body.h24},
			},
			ReturnValues: "ALL_NEW",
			UpdateExpression: "SET #A = :a, #B = :b, #C = :c"
		    };

		} else {

		    // build params object for the userdb update without 30min and 24hr test times
		    updates = {
			TableName: 'userDb',
			Key: {
			    'authId' : {S: authId},
			},
			ExpressionAttributeNames: {
			    "#A": 'status',
			},
			ExpressionAttributeValues: {
			    ":a": { S: status},
			},
			ReturnValues: "ALL_NEW",
			UpdateExpression: "SET #A = :a"
		    };
		}

		User.updateById(authId, updates, function (err, data) {
		    if (err) {
			console.log('Unable to update status in database');
			return res.redirect(303, '/demo');
		    }
		    // if update successful log data to console and move to
		    console.log('Updated user status in database');
		    res.send({success: true, message: 'Study file successfully saved!'});
		    //return res.redirect(303, '/instructions');
		});
	    }
	});
    } else {
	console.log('Invalid POST request to configdisplay.');
	res.send({success: false, message: 'invalid POST received'});
    }
});

// route to request the users status
app.post('/checkStatus', function(req, res){
    if(req.xhr || req.accepts('json,html')==='json'){
	console.log('Valid POST request to check users status');
	console.log(req.body.message);
	console.log('here are the stringified objects:');
	console.log(req.body.testType);

	// check user is logged in
	if(!req.session.passport) return res.redirect(303, '/login');
	if(!req.session.passport.user) return res.redirect(303, '/login');

	// get the user id
	var authId = req.session.passport.user;

	// get the users status from the UserDB
	User.findById(authId, function (err, user) {
	    if (err) {
		console.log('Unable to find user record in database');
		return res.redirect(303, '/login');
	    }
	    else {
		// return the users status
		res.send({success: true, message: user.status});
	    }
	});

    } else {
	console.log('Invalid POST request to checkStatus');
	res.send({success: false, message: 'invalid POST received'});
    }
});

// logout, destroying any session
app.get('/logout', function(req, res){
    // check user is logged in
    //if(!req.session.passport) return res.redirect(303, '/login');
    //if(!req.session.passport.user) return res.redirect(303, '/login');

    var logoutUrl = "/?project=" + req.session.project.name;
    req.session.destroy(function (err) {
	//Inside a callback… bulletproof!
	return res.redirect(303, logoutUrl);
	//return res.redirect(303, '/');
    });
});

// page that display the request headers
app.get('/headers', function(req,res){
    res.set('Content-Type','text/plain');
    var s = '';
    for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
    res.send(s);
});

// custom 404 page
app.use(function(req, res){
	res.status(404);
	res.render('404');
});

// 403 error handler for CSRF error
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  // handle CSRF token errors here
  res.status(403);
  res.render('403');
});

// custom 500 page
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

/*
app.listen(app.get('port'), function(){
    console.log( 'Express started in ' + app.get('env') +
		 ' mode on http://localhost:' + app.get('port') +
		 '; press Ctrl-C to terminate.' );
});
*/

// function to create out https server; variable declared at top level so can be referenced in the
// domain section
var server;
function startServer() {
    var server = https.createServer(httpsOptions, app).listen(app.get('port'), function(){
	console.log( 'Express started in ' + app.get('env') +
		     ' mode on https://localhost:' + app.get('port') +
		     '; press Ctrl-C to terminate.' );
    });
}

if(require.main === module){
    // application run directly; start app server
    startServer();
} else {
    // application imported as a module via "require": export function
    // to create server
    module.exports = startServer;
}
