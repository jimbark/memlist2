var express = require('express');

var app = express();

var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

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
