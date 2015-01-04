var mongo = require('mongoskin');
var express = require('express');
var session = require('express-session');
var logger = require('morgan');
var bodyParser = require('body-parser');
var multer  = require('multer');
var app = express();

var config = require('./config.js');

var db = mongo.db(config.mongourl, {native_parser:true});
db.bind('vacation');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs-locals'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(multer);
app.use(session({ 
	secret:"foobar", 
	resave: false, 
	saveUninitialized: false,
	cookie: {
		maxAge: 31536000000
	}
}));
app.use(logger('combined'));

app.get('/', function(req,res){
	if (req.session.username) {
		res.redirect('/user/' + req.session.username);
	} else {
		res.redirect('/index.html');
	}
});

app.post('/login', function(req,res){
	if (req.body.id) {
		req.session.username = req.body.id;
		res.redirect('/user/' + req.body.id);
	}
});

app.get('/newuser',function(req, res){
	res.render('newuser', {domain: config.domain});
});

app.post('/newuser',function(req,res){
	var data = req.body;

	var newuser = {};
	newuser.startDate = new Date();
	newuser.endDate = new Date();
	newuser.subject = "Out of the Office";
	newuser.message = "";
	newuser.list = [];
	newuser.name = data.user;

	dn.vaction.insert(newuser, function(err, result){
		if (err) {

		} else {
			req.session.username = result.name;
			res.redirect('/user/' + result.name);
		}
	});

});

app.get('/user/:user', function(req, res){
	console.log(req.params.user);

	db.vacation.findOne({name:req.params.user},function (err, item){
		if (err) {
			res.send(404, 'not found');
		} else {
			console.log("%j", item);
			res.render('user', {user: req.params.user, state: item});
		}
	});

});

app.post('/user/:user', function(req, res){
	var data = req.body;
	data.name = req.params.user;
	data.list = [];
	console.log('%j', data);
	db.vacation.update({name: req.params.user}, data, function(){
		console.log("done");
	});
	res.json({foo:'bar'});
});

var server = app.listen(3000, function() {

});