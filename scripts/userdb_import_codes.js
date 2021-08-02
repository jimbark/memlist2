var express= require('express');

var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser  = require('body-parser');
var fs = require('fs');
var sh = require('shorthash');
var env = app.get('env');
var studyID = "study4_1";

var credentials = require('./credentials.js');

var User = require('./lib/userdb.js');     // module with all dynamodb methods to access userDb


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




    var inVision = "null";
    if (req.body.vision) {
	inVision = req.body.vision;
	console.log('Vision (from visible form field): ' + req.body.vision);
	}
    var inContact = "null";
    if (req.body.contact) {
	inContact = req.body.contact;
	console.log('Contact (from visible form field): ' + req.body.contact);
	}
    var inActive = "null";
    if (req.body.active) {
	inActive = req.body.active;
	console.log('Active (from visible form field): ' + req.body.active);
	}
    var inSportLevel = "null";
    if (req.body.sportlevel) {
	inSportLevel = req.body.sportlevel;
	console.log('SportLevel (from visible form field): ' + req.body.sportlevel);
	}
    var inSportLength = "null";
    if (req.body.sportlength) {
	inSportLength = req.body.sportlength;
	console.log('SportLength (from visible form field): ' + req.body.sportlength);
	}
    var inSportMatches = "null";
    if (req.body.sportmatches) {
	inSportMatches = req.body.sportmatches;
	console.log('SportMatches (from visible form field): ' + req.body.sportmatches);
	}
    var inSportNumber = "null";
    if (req.body.sportnumber) {
	inSportNumber = req.body.sportnumber;
	console.log('SportNumber (from visible form field): ' + req.body.sportnumber);
	}
    var inSessionKnocks = "null";
    if (req.body.sessionknocks) {
	inSessionKnocks = req.body.sessionknocks;
	console.log('SessionKnocks (from visible form field): ' + req.body.sessionknocks);
	}
    var inFirstInjury = "null";
    if (req.body.firstinjury) {
	inFirstInjury = req.body.firstinjury;
	console.log('FirstInjury (from visible form field): ' + req.body.firstinjury);
	}
    var inLastInjury = "null";
    if (req.body.lastinjury) {
	inLastInjury = req.body.lastinjury;
	console.log('LastInjury (from visible form field): ' + req.body.lastinjury);
	}
    var inSteroids = "null";
    if (req.body.steroids) {
	inSteroids = req.body.steroids;
	console.log('Steroids (from visible form field): ' + req.body.steroids);
	}
    var inDrugFrequency = "null";
    if (req.body.drugfrequency) {
	inDrugFrequency = req.body.drugfrequency;
	console.log('DrugFrequency (from visible form field): ' + req.body.drugfrequency);
	}
    var inCogChanges = "null";
    if (req.body.cogchanges) {
	inCogChanges = req.body.cogchanges;
	console.log('CogChanges (from visible form field): ' + req.body.cogchanges);
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

	    "#AA": 'vision',
	    "#AB": 'contact',
	    "#AC": 'active',
	    "#AD": 'sportlevel',
	    "#AE": 'sportlength',
	    "#AF": 'sportmatches',
	    "#AG": 'sportnumber',
	    "#AH": 'sessionknocks',
	    "#AI": 'firstinjury',
	    "#AJ": 'lastinjury',
	    "#AK": 'steroids',
	    "#AL": 'drugfrequency',
	    "#AM": 'cogchanges',

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

	    ":aa": {S: inVision},
	    ":ab": {S: inContact},
	    ":ac": {S: inActive},
	    ":ad": {S: inSportLevel},
	    ":ae": {S: inSportLength},
	    ":af": {S: inSportMatches},
	    ":ag": {S: inSportNumber},
	    ":ah": {S: inSessionKnocks},
	    ":ai": {S: inFirstInjury},
	    ":aj": {S: inLastInjury},
	    ":ak": {S: inSteroids},
	    ":al": {S: inDrugFrequency},
	    ":am": {S: inCogChanges},

	},
	ReturnValues: "ALL_NEW",
	UpdateExpression: "SET #B = :b,#C = :c,#D = :d,#E = :e,#F = :f,#G = :g,#H = :h,#I = :i,#J = :j,#K = :k,#L = :l,#M = :m,#N = :n,#O = :o,#P = :p,#Q = :q,#R = :r,#S = :s,#T = :t,#U = :u,#V = :v,#W = :w,#X = :x,#Y = :y, #AA = :aa, #AB = :ab, #AC = :ac, #AD = :ad, #AE = :ae, #AF = :af, #AG = :ag, #AH = :ah, #AI = :ai, #AJ = :aj, #AK = :ak, #AL = :al, #AM = :am"
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

