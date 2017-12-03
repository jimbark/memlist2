var express = require('express');

var app = express();

var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser  = require('body-parser');
var fs = require('fs');
var credentials = require('./credentials.js');

var User = require('./lib/userdb.js');     // module with all dynamodb methods to access userDb

// setup authetication
var auth = require('./lib/auth.js')(app, {
	providers: credentials.authProviders,
	successRedirect: '/learn',
	failureRedirect: '/login',
});

// auth.init() links in Passport middleware:
auth.init();

// set up handlebars view engine
var exphbs  = require('express-handlebars');
app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'main'}));
app.set('view engine', '.hbs');

app.set('port', process.env.PORT || 3000);

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
	accessKeyId: credentials.aws.development.accessKeyId,
	secretAccessKey: credentials.aws.development.secretAccessKey,
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



app.use(function(req, res, next){
    res.locals.showTests = app.get('env') !== 'production' &&
	req.query.test === '1';
    next();
});

app.get('/', function(req, res){
    res.clearCookie("signed_monster");
    res.render('home');
});
app.get('/about', function(req, res){
    var signedMonster = req.signedCookies.signed_monster;
    console.log(signedMonster);
    res.render('about', {pageTestScript: '/qa/tests-about.js'});

});

/*
app.get('/learn', function(req, res){
    res.cookie('signed_monster', 'nom nom', { signed: true });

    res.locals.flash = {
	    type: 'success',
	    intro: 'Thank you!',
	    message: 'You have now been signed up for the newsletter.',
	};

    res.render('learn');
});
*/

// make use of authentication when start study
app.get('/learn', function(req, res){

    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');
    //if(!req.user) return res.redirect(303, '/login');

    res.cookie('signed_monster', 'nom nom', { signed: true });

    res.locals.flash = {
	    type: 'success',
	    intro: 'Thank you!',
	    message: 'You are logged in and can start learning.',
	};

    // TODO if a new participant then display consent page

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
	    // if existing participant display learn page
	    res.render('register');
	}
	else if (user.status == 'registered'){
	    // if existing participant display learn page
	    res.render('learn');
	}
	else if (user.status == 'returning'){
	    // if existing participant display learn page
	    res.render('learn');
	}
	else {
	    // if any other status display learn page
	    res.render('login');
	}
    });
});

app.get('/login', function(req, res){
    res.render('login');
});


// specify our auth routes:
auth.registerRoutes();



app.get('/consent', function(req, res){
    res.render('consent');
});

app.get('/withdraw', function(req, res){
    res.render('withdraw');
});

app.get('/register', function(req, res){
    res.render('register');
});

app.post('/register', function(req, res){

    console.log('Form (from querystring): ' + req.query.form);
    //console.log('CSRF token (from hidden form field): ' + req.body._csrf);
    console.log('Checkbox status (from visible form field): ' + req.body.consented);

    // TODO - store the consent in userdb
    //User.updateById = function(authId, attr, value, cb) {

    // check user is logged in
    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');

    // get the user id
    var authId = req.session.passport.user;

    if (req.body.consented == "on") {
	User.updateById(authId, 'status', 'consented', function (err, data) {
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

app.post('/demographics', function(req, res){

    console.log('Form (from querystring): ' + req.query.form);
    //console.log('CSRF token (from hidden form field): ' + req.body._csrf);
    console.log('Age(from visible form field): ' + req.body.age);
    console.log('Email (from visible form field): ' + req.body.email);
    console.log('Gender (from visible form field): ' + req.body.gender);

    // TODO - store the demographics info in userdb
    //User.updateById = function(authId, attr, value, cb) {

    // check user is logged in
    if(!req.session.passport) return res.redirect(303, '/login');
    if(!req.session.passport.user) return res.redirect(303, '/login');

    // get the user id
    var authId = req.session.passport.user;


    User.updateById(authId, 'userEmail', req.body.email, function (err, data) {
	if (err) {
	    console.log('Unable to update user email address in database');
	    return res.redirect(303, '/register');
	}
	// if update successful log data to console and move to
	console.log('Updated user email address in database');
	return res.redirect(303, '/instructions');
    });

/*
    User.updateById(authId, 'gender', req.body.gender, function (err, data) {
	if (err) {
	    console.log('Unable to update user gender in database');
	    return res.redirect(303, '/register');
	}
	// if update successful log data to console and move to
	console.log('Updated user gender in database');
	return res.redirect(303, '/about');
    });
*/
/*
    User.updateById(authId, 'age', req.body.age, function (err, data) {
	if (err) {
	    console.log('Unable to update user age in database');
	    return res.redirect(303, '/register');
	}
	// if update successful log data to console and move to
	console.log('Updated user age in database');
	return res.redirect(303, '/about');
    });
*/

});


app.get('/instructions', function(req, res){
    res.render('instructions');
});



/*  TODO
// version of route that saves study data to dynamodb userdb
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
//	fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
	if (!fs.existsSync(dataDir)) {fs.mkdirSync(dataDir);}

	var studyFile = dataDir + '/' + req.body.testType + req.body.startDate.replace(/\"/g,"");

	fs.writeFile(studyFile, req.body.lists, function (err) {
	    if (err) {
		console.log('error saving file');
		res.send({success: true, message: 'valid POST received but error saving file to server'});
		throw err;

	    } else {
		console.log("File named " + studyFile + " saved!");
		res.send({success: true, message: 'Study file successfully saved to server!'});

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
	    }
	});

    } else {
	console.log('Invalid POST request to configdisplay.');
	res.send({success: false, message: 'invalid POST received'});
    }

});
*/


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
		res.send({success: true, message: 'Study file successfully saved to server!'});

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
	    }
	});

    } else {
	console.log('Invalid POST request to configdisplay.');
	res.send({success: false, message: 'invalid POST received'});
    }

});


/*  route to handle request to save config file to ZTP server
app.post('/listload', function(req, res){
    if(req.xhr || req.accepts('json,html')==='json' || req.body.buttonid==='ztpsave'){
	console.log('Valid POST request to configdisplay with buttonid = ' + req.body.buttonid);

	// save the .cfg file in the files/ztpready directory
	var cfgfile = 'public/files/ztpready/' + info.params.localswitchname + '.cfg';
	fs.writeFile(cfgfile, info.conf, function (err) {
	    if (err) {
		console.log('error saving file');
		throw err;
	    } else {
		console.log("File named " + cfgfile + " saved!");
		res.send({success: true, message: 'Config file successfully saved to ZTP server!'});
	    }
	});
    } else {
	console.log('Invalid POST request to configdisplay.');
	res.send({success: false, message: 'Webserver unable to save file on ZTP server; check Webserver log for
 further information.'});
    }
});

*/






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

// custom 500 page
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.' );
});
