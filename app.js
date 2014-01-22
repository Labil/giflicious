var apptitle = 'Giflicious';
var port = '5000'; //Heroku deploys on port 5000, therefore the app has to use this as well

var express = require('express');
var app = express();
var cons = require('consolidate'); //templating lib
var MongoClient = require('mongodb').MongoClient; //mongo driver
var routes = require('./routes'); //this gets index.js, which takes care of all the routing (could also be written './routes/index.js')
//var request = require('request');
//var _ = require('underscore');

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost:27017/giflicious';

MongoClient.connect(mongoUri, function(err, db){
	if(err) throw err;

	app.engine('html', cons.swig);
	app.set('view engine', 'html');
	app.set('views', __dirname + '/views');

	app.use("/css", express.static(__dirname + "/css")); //must declare folder as static directory to access it

	routes(app, db); //application routes in index.js
	
	app.listen(process.env.PORT || port)
	console.log('Express server started listening on port');

}); 
