// Require modules
var http = require('http');
var winston = require('winston');
var Datastore = require('nedb')
    , db = new Datastore({ filename: __dirname + '/db/live_server.db', timestampData: true, autoload: true });


// Find presses
db.find({}, {DeviceID:1}, function (err, updates) {

    var presses = [];

    updates.forEach(function(update){
        if(typeof presses[update.DeviceID] === 'undefined'){
            presses[update.DeviceID] = 1;
        }

    });

    console.log(presses);

    buildRanges(presses);

});

var buildRanges = function(presses){

    Object.keys(presses).forEach(function(press){

        // Find one presses updates at a time
        db.find({DeviceID:press}).sort({ createdAt: 1 }).exec(function (err, updates) {
            // Set some starter variables
            var last;

            var currentClicks = 0;
            var currentTime = 0;
            var updateCounter = 0;

            var ranges = [];

            console.log('INTERPRET '+press);

            // Loop through each update
            updates.forEach(function(update, index){
                //console.log(index);

                if(index === 0){
                    // First, do nothing

                } else {
                    // All others

                    // Try to build a range
                    if(update.StatusDetails == last.StatusDetails){
                        // Continue growing range

                        // Increment time
                        var newDiff = Math.abs(update.createdAt-last.createdAt);
                        currentTime += newDiff;

                        // Increment clicks
                        var newClicks = Math.abs(update.ProductionCounter-last.ProductionCounter);
                        currentClicks += newClicks;

                        updateCounter++;

                    } else {
                        // end and start a new range
                        // Increment time
                        var newDiff = Math.abs(update.createdAt-last.createdAt);
                        currentTime += newDiff;

                        // Increment clicks
                        var newClicks = Math.abs(update.ProductionCounter-last.ProductionCounter);
                        currentClicks += newClicks;


                        // End the last one since this is new
                        ranges.push({
                            statusDetails: last.StatusDetails,
                            id: last._id,
                            elapsedClicks: currentClicks,
                            diffMs: currentTime,
                            diffSec: Math.round(currentTime/100),
                            diffMin: Math.round(currentTime/100/60),
                            start: last.createdAt,
                            //end: last.createdAt,
                            updates: updateCounter
                        });

                        currentClicks = 0;
                        currentTime = 0;
                        updateCounter = 0;
                    }

                }

                // Set for next in the loop
                last = update;
            });

            console.log(ranges);
        });
    });
    
};
