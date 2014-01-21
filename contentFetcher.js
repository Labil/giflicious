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

			var insertGifsToDB = function(){
				console.log("gifData.length at insertion point: " + gifData.length);
				if(gifData.length > 0){
					collection.insert(gifData, {upsert:true}, function(err, data){
						if(err) throw err;
						if(data){
							for(var j = 0; j < data.length; j++)
								console.dir("Inserting gif:" + data[j].title + " to database.");
							callback(true);
						}
				//		db.close();
					});
				}
				else {  //Should be fixed, here there is no safety or checking that we actually have data
					callback(true);
				}
			};
			var removeGifs = function(){
				for(var k = 0; k < indicesToSplice.length; k++){
					gifData.splice(indicesToSplice[k], 1);
				}
				console.log("Gifs after removing: " + gifData.length);
				insertGifsToDB();
			};

			var finished = _.after(gifData.length, removeGifs);

			//Removes invalid gifs and gifs that already exists in db
			//Loops backwards, if not the splice will get fucked up cause we're looping in the same direction as we're removing items
			var i = gifData.length;
			var indicesToSplice = [];
			while(i--){
				if(gifData[i].url.search('.gif') == -1 && gifData[i].url.search('.png') == -1){
					console.log("Found invalid gif, removing");
					//gifData.splice(i, 1);
					indicesToSplice.push(i);
					finished();
				}
				else{
					collection.findOne({ "title":gifData[i].title}, function(err, match){
						if(err) throw err;
						if(match){
							console.log("Found match on gif title: " + match.title);
							indicesToSplice.push(i);
						}
						finished();
					});	
				}
				
			}
		});

	}

}

module.exports.ContentFetcher = ContentFetcher;

/*function ContentFetcher(db){

	//The constructor needs to be called by the "new" keyword, so that "this" points to the global object
	if((this instanceof ContentFetcher === false)){
		return new ContentFetcher(db); 
	}

	this.collection = db.collection("gifs");

}

ContentFetcher.prototype.getGifs = function(num, callback){

	this.collection.find().sort('created', -1).limit(num).toArray(function(err, gifs){

		if(err) return callback(err, null);
		console.log("Found" + gifs.length + " gifs");

		callback(err, gifs);
	});
}

module.exports.ContentFetcher = ContentFetcher;*/
