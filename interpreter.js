// Require modules
var http = require('http');
var winston = require('winston');
var Datastore = require('nedb')
    , db = new Datastore({ filename: __dirname + '/db/live_server.db', timestampData: true, autoload: true });
var fs = require('fs');
var request = require('request');
var argv = require('yargs')
    .usage('Usage: $0 --range-endpoint [url]')
    .demand(['range-endpoint'])
    .argv;

var range_endpoint = argv["range-endpoint"];

// Prepare log file
winston.add(winston.transports.File, { filename: __dirname+'/logs/interpreter.log' });

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
            var currentRange = [];
            var totalRemoved = 0;
            var updatesToDelete = [];

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
                            updates: currentRange.length,
                            press:press
                        });

                        //console.log('remove'+currentRange.length);
                        totalRemoved += currentRange.length;

                        updatesToDelete.push(currentRange);

                        currentClicks = 0;
                        currentTime = 0;
                        currentRange = [];
                    }

                }

                currentRange.push(update._id);

                // Set for next in the loop
                last = update;
            });

            console.log('updates: '+updates.length);
            console.log('ranges: '+ranges.length);
            console.log('totalRemoved: '+totalRemoved);
            console.log(updatesToDelete);

            postRanges(ranges, updatesToDelete);




        });
    });

};


var postRanges = function(ranges, updatesToDelete){


    //console.log({ranges:ranges.slice(0,3)});


    request(range_endpoint,
        { json: true, body: {ranges:ranges} },
        function(err, res, body) {
            // `body` is a js object if request was successful

            if(!err && res.statusCode == 200){
                console.log('POST successful');

                //console.log(body);
            } else {
                winston.log('error', {post_error:res.statusCode});
            }



            //console.log(res);

        });
};
