
var mongodb = require('mongodb'),
	async = require('async'),
	config = require('./config')

var Elo = function() {
  this.dbClient = databaseClient;
  this.users = users;
  this.utils = utils;
};

/* need to be able to add a match with win loss 
this contains elo rating of two players
corresponding elo rating change has to be calculated and set after result */

/* provisional rankings with higher k factor for first 650 games (unkranked calibration) */

/* offical rankings with lower k factor after 650 games (ranked calibration) */


Elo.prototype.calculateExpectedScore = function(rA, rB) {
	return 1/(1+ Math.pow(10, (rB - rA)/400));
}

/* matchResult - 1 (A wins over B)
   matchResult - 0.5 (A & B Draw)
   matchResult - 0 (A loses to B) */

Elo.prototype.calculatePostRating = function(rA, rB, matchResult, kFactor) {

	let newRating = {};
	let self = this;

	let expectScore = self.Elo.calculateExpectedScore(rA, rB)
	newRating.ratingA = rA + kFactor*(matchResult - expectScore);
	newRating.ratingB = rB + kFactor*(expectScore - matchResult);

	return newRating;
}

Elo.prototype.parseMatchData = function(userId1, userId2, matchData, callback) {
	let self = this;
	let userInfo;

 	self.users.getUserInfo([userId1, userId2], function(err, userInfo) {
 		if (err)
 			callback("Can't get user details");
 		else {

    		var ratingA = userInfo[0].rating;
	        var ratingB = userInfo[1].rating;

	        var kFactor = (Math.max(userInfo[0].numGames, userInfo[1].numGames) > config.unRankedLimit) ? config.RankedKFactor : config.unRankedKFactor;
	        let returnData = self.calculatePostRating(ratingA, ratingB, matchData.result, kFactor); 
	        		
	        callback(err, returnData);
	     }
  	});
};

module.exports = Elo;