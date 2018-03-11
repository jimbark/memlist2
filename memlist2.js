var express = require('express');

var app = express();

var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser  = require('body-parser');
var fs = require('fs');

var env = app.get('env');

var credentials = require('./credentials.js');

var User = require('./lib/userdb.js');     // module with all dynamodb methods to access userDb
var s3Store = require('./lib/s3lib.js');    // module with all methods to access S3

// setup authetication
var auth = require('./lib/auth.js')(app, {
	providers: credentials.authProviders,
	successRedirect: '/learn',
	failureRedirect: '/login',
});

// enable use of https
var https = require('https');  
var httpsOptions = {
        key: fs.readFileSync(__dirname + '/ssl/memlist.pem'),
        cert: fs.readFileSync(__dirname + '/ssl/memlist.crt')
};
var HTTP_PORT  = 80;
var HTTPS_PORT = 443;

// create separate server just to perform http to http redirect
var http       = require('http');
var http_app = express();
http_app.set('port', HTTP_PORT);

http_app.all('/*', function(req, res, next) {
  if (/^http$/.test(req.protocol)) {
    var host = req.headers.host.replace(/:[0-9]+$/g, ""); // strip the port # if any
    if ((HTTPS_PORT != null) && HTTPS_PORT !== 443) {
      return res.redirect(301, "https://" + host + ":" + HTTPS_PORT + req.url);
    } else {
      return res.redirect(301, "https://" + host + req.url);
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
app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'main'}));
app.set('view engine', '.hbs');

app.set('port', process.env.PORT || HTTPS_PORT);

app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next){
	res.locals.copyrightYear = '2018';
	next();
});

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

// exmaple of clearing a cookie
app.get('/', function(req, res){
    res.clearCookie("signed_monster");
    res.render('home');
});

// exmaple of reading a cookie from a request
app.get('/about', function(req, res){
    var signedMonster = req.signedCookies.signed_monster;
    console.log(signedMonster);
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

    res.cookie('signed_monster', 'nom nom', { signed: true });

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
	// if new user get their consent to participate
	else if (user.status == 'new') {
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
	    // if returning participant display delayed test page
	    res.render('delayed');
	}
	else if (user.status == 'demoed'){
	    // if demo has been completed display learn page
	    res.render('learn');
	}
	else if (user.status == 'delayed1'){
	    // if demo has been completed display learn page
	    res.render('delayed2');
	}
	else if (user.status == 'complete'){
	    // if demo has been completed display learn page
	    res.render('end');
	}
	else {
	    // if any other status display 500 error page
	    res.render('500');
	}
    });
});

app.get('/login', function(req, res){
    res.render('login');
});


// specify our auth routes:
auth.registerRoutes();



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
    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');
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

	    // delete the old record
	    User.deleteById('userDb', authId, function (err,data) {
		if (err) {
		    console.log('Unable to delete old user record in database');
		    return res.redirect(303, '/consent');
		}
		// if update successful log data to console
		console.log('Old user record deleted from database');
		//req.logOut();
		//res.render('withdrawn');

		req.session.destroy(function (err) {
		    //res.render('withdrawn'); //Inside a callback… bulletproof!
		    return res.redirect(303, '/withdrawn');
		});

		//return res.redirect(303, '/register');
	    });
	});
    });
});

app.post('/demographics', function(req, res){

    console.log('Form (from querystring): ' + req.query.form);
    //console.log('CSRF token (from hidden form field): ' + req.body._csrf);
    console.log('Age(from visible form field): ' + req.body.age);
    //console.log('Email (from visible form field): ' + req.body.email);
    console.log('Gender (from visible form field): ' + req.body.gender);
    console.log('Education (from visible form field): ' + req.body.education);
    console.log('English standard (from visible form field): ' + req.body.english);

    // check user is logged in
    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');

    // get the user id
    var authId = req.session.passport.user;

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

	},
	ExpressionAttributeValues: {
	    ":b": { S: req.body.gender},
	    ":c": { N: req.body.age},
	    ":d": { S: 'registered'},
	    ":e": { S: req.body.education},
	    ":f": { S: req.body.english},
	    ":g": { S: req.body.nationality},

	},
	ReturnValues: "ALL_NEW",
	UpdateExpression: "SET #B = :b, #C = :c, #D = :d, #E = :e, #F = :f, #G = :g"
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
    res.render('postInstructions');
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
	else if (user.status == 'learnt'){
	    // if returning participant display learn page
	    res.render('delayed');
	}
	else if (user.status == 'demoed'){
	    // if demo has been completed display learn page
	    res.render('learn');
	}
	else if (user.status == 'delayed1'){
	    // if demo has been completed display learn page
	    res.render('delayed2');
	}
	else if (user.status == 'complete'){
	    // if demo has been completed display learn page
	    res.render('end');
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

// version of route that saves study data to S3
app.post('/studySave', function(req, res){
    if(req.xhr || req.accepts('json,html')==='json'){
	console.log('Valid POST request to save study session data ');
	console.log(req.body.message);
	console.log('here are the stringified objects:');
	console.log(req.body.lists);
	console.log(req.body.testType);
	var lists = JSON.parse(req.body.lists);
	var startDate = JSON.parse(req.body.startDate);
	var endDate = JSON.parse(req.body.endDate);
	console.log('here are the unstringified objects:');
	console.log(lists);
	console.log(startDate);
	console.log(endDate);

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

	s3Store.s3Upload(bucket, studyFile, req.body.lists, function (err,data) {
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

		// build params object for the userdb update
		var updates = {
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


/*
// version of route that saves study data as local file on server
app.post('/studySave', function(req, res){
    if(req.xhr || req.accepts('json,html')==='json'){
	console.log('Valid POST request to save study session data ');
	console.log(req.body.message);
	console.log('here are the stringified objects:');
	console.log(req.body);
	console.log(req.body.lists);
	console.log(req.body.testType);
	var lists = JSON.parse(req.body.lists);
	var startDate = new Date(JSON.parse(req.body.startDate));
	var endDate = new Date(JSON.parse(req.body.endDate));
	var duration = endDate.getTime() - startDate.getTime();
	console.log('duration of test: ', duration);
	console.log('here are the unstringified objects:');
	console.log(lists);
	console.log(startDate);
	console.log(endDate);

	var dataDir = __dirname + '/data';
//	fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
	if (!fs.existsSync(dataDir)) {fs.mkdirSync(dataDir);}

	var studyFile = dataDir + '/' + req.body.testType + req.body.startDate.replace(/\"/g,"");

	fs.writeFile(studyFile, JSON.stringify(req.body), function (err) {
	//fs.writeFile(studyFile, req.body.lists, function (err) {
	    if (err) {
		console.log('error saving file');
		res.send({success: true, message: 'valid POST received but error saving file to server'});
		throw err;

	    } else {
		console.log("File named " + studyFile + " saved!");
		//res.send({success: true, message: 'Study file successfully saved to server!'});

		// read file back just to test the code to do this
		fs.readFile(studyFile, function(err, data) {
		    if (err) {
			console.log('error reading studysave file');
			throw err;
		    } else {
			console.log('reloaded file as:' + data); // show stringified content
			var reloadData = JSON.parse(data);
			console.log('reloaded and unstringified object:' + reloadData);  // not object display
			console.log(reloadData);  // need to do this to display as object
		    }
		});

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

		// get the user id
		var authId = req.session.passport.user;

		// build params object for the userdb update
		var updates = {
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

		User.updateById(authId, updates, function (err, data) {
		    if (err) {
			console.log('Unable to update status to demoed in database');
			return res.redirect(303, '/demo');
		    }
		    // if update successful log data to console and move to
		    console.log('Updated user status to demoed in database');
		    res.send({success: true, message: 'Study file successfully saved to server!'});
		    //return res.redirect(303, '/instructions');
		});

	    }
	});

    } else {
	console.log('Invalid POST request to configdisplay.');
	res.send({success: false, message: 'invalid POST received'});
    }

});
*/

// logout, destroying any session
app.get('/logout', function(req, res){
    // check user is logged in
    //if(!req.session.passport) return res.redirect(303, '/login');
    //if(!req.session.passport.user) return res.redirect(303, '/login');

    req.session.destroy(function (err) {
	//Inside a callback… bulletproof!
	return res.redirect(303, '/');
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

https.createServer(httpsOptions, app).listen(app.get('port'), function(){
    console.log( 'Express started in ' + app.get('env') +
                 ' mode on https://localhost:' + app.get('port') +
                 '; press Ctrl-C to terminate.' );
});
