var apptitle = 'Giflicious';
var port = '8080';

var express = require('express');
var app = express();
var cons = require('consolidate'); //templating lib
var MongoClient = require('mongodb').MongoClient; //mongo driver
var routes = require('./routes'); //this gets index.js, which takes care of all the routing (could also be written './routes/index.js')
var request = require('request');

MongoClient.connect('mongodb://localhost:27017/giflicious', function(err, db){
	if(err) throw err;

	request('http://www.reddit.com/r/gifs/.json', function(error, response, body){
		if(!error && response.statusCode == 200){
			var obj = JSON.parse(body);

			var gifData = obj.data.children.map(function(data){
				
				var info = {
					"title": data.data.title,
			    	"url": data.data.url,
			    	"timestamp": data.data.created
				};	
				return info;
			});
			
			console.log(gifData.length);

			//Removes any urls that are not direct links (i.imgur......gif)
			for(var i = 0; i < gifData.length; i++){
				if(gifData[i].url.search('.gif') == -1 && gifData[i].url.search('.png') == -1){
					console.log("Found undefined");
					gifData.splice(i, 1);
				}
			}

			db.collection('gifs').insert(gifData, {upsert:true}, function(err, data){
				//if(err) throw err;
				if(err) console.log("error inserting " + err);

				console.dir(data);
		//		db.close();
			});
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
