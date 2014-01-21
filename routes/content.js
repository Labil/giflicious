var ContentFetcher = require('../contentFetcher').ContentFetcher;

function ContentHandler(db){
	
	var contentFetcher = new ContentFetcher(db);

	this.displayMainPage = function(req, res, next){

		contentFetcher.scrapeReddit(function(loaded){
			if(!loaded) return next(err);

			contentFetcher.getGifs(25, function(err, result){

				if(err) return next(err);

				return res.render('index', {
					title: 'Giflicious',
					gifs: result
				});
			});
		});

	};

}

module.exports = ContentHandler;


/*function ContentHandler(db){
	
	this.contentFetcher = new ContentFetcher(db);

}

ContentHandler.prototype.displayMainPage = function(req, res, next){

	this.contentFetcher.getGifs(1, function(err, results){

		if(err) return next(err);

		return res.render('index', {
			title: 'Giflicious',
			gifs: results
		});
	});
}

module.exports = ContentHandler;*/
