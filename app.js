var express = require('express');
var http = require('http');
var url = require('url');

var app = express();
var server = http.createServer();

var locals = {
        title:       'Tring Clocks',
        description: 'Clock power data visualizer',
        author:      'Byron Mallett'
};

var port = 4000;

//------------------
//Set up application
//
app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/static'));
	app.use(app.router);
    //app.use(function(err, req, res, next){ res.render('500.ejs', { locals: { error: err },status: 500 }); });
	app.enable("jsonp callback");
});

app.configure('development', function(){
   app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
   app.use(express.errorHandler()); 
});

app.listen(port);

console.log("Listening on port %d in %s mode", port, app.settings.env);



//==================
//Request functions
//------------------
app.get('/', function(req,res){
    locals.date = new Date().toLocaleDateString();
    res.render('index.jade', locals);
});


/* The 404 Route (ALWAYS Keep this as the last route) */
app.get('/*', function(req, res){
    res.send("404");
    //res.render('404.ejs', locals);
});