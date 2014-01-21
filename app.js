var apptitle = 'Giflicious';
var port = '8080';

var express = require('express');
var app = express();
var cons = require('consolidate'); //templating lib
var MongoClient = require('mongodb').MongoClient; //mongo driver
var routes = require('./routes'); //this gets index.js, which takes care of all the routing (could also be written './routes/index.js')
var request = require('request');
var _ = require('underscore');

MongoClient.connect('mongodb://localhost:27017/giflicious', function(err, db){
	if(err) throw err;

	var gifData = {};

	request('http://www.reddit.com/r/gifs/.json', function(error, response, body){
		if(!error && response.statusCode == 200){
			var obj = JSON.parse(body);

			gifData = obj.data.children.map(function(data){
				var info = {
					"title": data.data.title,
			    	"url": data.data.url,
			    	"timestamp": data.data.created
				};
				return info;
			});
		}

		var insertGifsToDB = function(){
			console.log("gifData.length at insertion point: " + gifData.length);
			if(gifData.length > 0){
				db.collection('gifs').insert(gifData, {upsert:true}, function(err, data){
					if(err) throw err;
					if(data)
						console.dir("Inserting gif:" + data[0].title + " to database.");
			//		db.close();
				});
			}
		};

		var finished = _.after(gifData.length, insertGifsToDB);

		//Removes invalid gifs and gifs that already exists in db
		//Loops backwards, if not the splice will get fucked up cause we're looping in the same direction as we're removing items
		var i = gifData.length;
		while(i--){
			if(gifData[i].url.search('.gif') == -1 && gifData[i].url.search('.png') == -1){
				console.log("Found invalid gif, removing");
				gifData.splice(i, 1);
				finished();
			}
			else{
				db.collection('gifs').findOne({ "title":gifData[i].title}, function(err, match){
					if(err) throw err;
					if(match){
						console.log("Found match on gif title: " + match.title);
						gifData.splice(i, 1);
					}
					finished();
				});	
			}
			
		}
	});

	app.engine('html', cons.swig);
	app.set('view engine', 'html');
	app.set('views', __dirname + '/views');

	app.use("/css", express.static(__dirname + "/css")); //must declare folder as static directory to access it

	routes(app, db); //application routes in index.js
	
	app.listen(port);
	console.log('Express server started listening');

}); 
