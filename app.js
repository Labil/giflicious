//TODO:
//		- Nicer font title and description
//		- Fetch random gifs from DB
//		- Show stats about what type of tags/nsfw/popular words in titles etc
//		- Search for gifs with keyword in title
//		- Multiple pages (1 2 3 4 5 etc) with max 20/25 per page ---maybe less, five? To decrease loading. Make it a preference

var apptitle = 'Giflicious';
var port = '5000'; //Heroku deploys on port 5000, therefore the app has to use this as well

var express = require('express');
var app = express();
var cons = require('consolidate'); //templating lib
var MongoClient = require('mongodb').MongoClient; //mongo driver
var routes = require('./routes'); //this gets index.js, which takes care of all the routing (could also be written './routes/index.js')

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
