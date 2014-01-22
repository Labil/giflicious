/* Takes care of querying db, on behalf of content.js */
var request = require('request');
var _ = require('underscore');

function ContentFetcher(db){

	//The constructor needs to be called by the "new" keyword, so that "this" points to the global object
	if((this instanceof ContentFetcher === false)){
		return new ContentFetcher(db); 
	}

	var collection = db.collection("gifs");

	this.getGifs = function(num, callback){

		collection.find().sort('timestamp', -1).limit(num).toArray(function(err, documents){
		
			if(err) return callback(err, null);
			console.log("Found" + documents.length + " gifs");
			callback(err, documents);
			
		});
	};
	//Callback true when we have finished scraping and inserting new gifs to the db from reddit
	this.scrapeReddit = function(callback){

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

			var insertGifsToDB = function(gifs){
				if(gifs.length > 0){
					collection.insert(gifs, {upsert:true}, function(err, data){
						if(err) throw err;
						if(data){
							callback(true);
						}
				//		db.close();
					});
				}
				//Even tho we haven't inserted anything new to the db, we still want the calling
				//code to fetch whatever's in there from before and display that, so callback(true)
				else {
					callback(true);
				}
			};

			var bestGifs = [];
			var removeExisting = function(){
				for(var i = 0; i < goodGifs.length; i++){
					var test = true;
					for(var j = 0; j < usedGifNames.length; j++){
						if(goodGifs[i].title == usedGifNames[j]){
							test = false;
						}
					}
					if(test)
						bestGifs.push(goodGifs[i]);
				}
				insertGifsToDB(bestGifs);
			}
			
			var goodGifs = [];

			var isUrlGood = function(url){
				return (url.search('.gif') != -1 || url.search('.png') != -1);
			};
			//Removes invalid gifs and gifs that already exists in db			
			for(var i = 0; i < gifData.length; i++){
				if(isUrlGood(gifData[i].url)){
					goodGifs.push(gifData[i]);
				}
			}
			var finished = _.after(goodGifs.length, removeExisting);

			var usedGifNames = [];
			for(var i = 0; i < goodGifs.length; i++){
				collection.findOne({ "title":goodGifs[i].title}, function(err, match){
					if(err) throw err;
					if(match){
						usedGifNames.push(match.title);
					}
					finished();
				});	
			}
		});

	}

}

module.exports.ContentFetcher = ContentFetcher;