var express = require('express');

var app = express();

var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser  = require('body-parser');
var fs = require('fs');
var credentials = require('./credentials.js');

// set up handlebars view engine
var exphbs  = require('express-handlebars');
app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'main'}));
app.set('view engine', '.hbs');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

//app.use(require('cookie-parser')(credentials.cookieSecret));
//app.use(require('express-session')());


app.use(cookieParser(credentials.cookieSecret));

// use session store running against MemoryStore
app.use(expressSession({
    secret: credentials.cookieSecret,
    resave: false,
    saveUninitialized: false,
}));

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
app.get('/learn', function(req, res){
    res.cookie('signed_monster', 'nom nom', { signed: true });

    res.locals.flash = {
	    type: 'success',
	    intro: 'Thank you!',
	    message: 'You have now been signed up for the newsletter.',
	};

    res.render('learn');
});



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
