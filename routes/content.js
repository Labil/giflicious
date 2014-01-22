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