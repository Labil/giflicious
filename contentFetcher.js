/* Takes care of querying db, on behalf of content.js */

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
