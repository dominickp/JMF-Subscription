// Require modules
var http = require('http');
var winston = require('winston');

var fs = require('fs');
var request = require('request');



var Interpreter = function (db, argv) {


    var model = this;

    var range_endpoint = argv["range-endpoint"];



    model.init = function(){


        // Prepare log file
        //winston.add(winston.transports.File, {filename: __dirname + '/logs/interpreter.log'});

        model.findPresses(function(presses){
            model.buildRanges(presses, function(ranges, updatesToDelete){
                model.postRanges(ranges, updatesToDelete, function(){
                    console.log('Done with final callback');
                });
            });
        });
    };

    model.findPresses = function(callback) {

        // Find presses
        db.find({}, {DeviceID: 1}, function (err, updates) {

            var presses = [];

            updates.forEach(function (update) {
                if (typeof presses[update.DeviceID] === 'undefined') {
                    presses[update.DeviceID] = 1;
                }
            });

            console.log(presses);

            //model.buildRanges(presses);
            callback(presses);

        });
    };

    model.buildRanges = function (presses, callback) {

        Object.keys(presses).forEach(function (press) {

            // Find one presses updates at a time
            db.find({DeviceID: press}).sort({createdAt: 1}).exec(function (err, updates) {
                // Set some starter variables
                var last;

                var currentClicks = 0;
                var currentTime = 0;
                var currentRange = [];
                var totalRemoved = 0;
                var updatesToDelete = [];
                var newDiff, newClicks;

                var ranges = [];

                // Loop through each update
                updates.forEach(function (update, index) {
                    //console.log(index);

                    if (index === 0) {
                        // First, do nothing

                    } else {
                        // All others

                        // Try to build a range
                        if (update.StatusDetails == last.StatusDetails) {
                            // Continue growing range

                            // Increment time
                            newDiff = Math.abs(update.createdAt - last.createdAt);
                            currentTime += newDiff;

                            // Increment clicks
                            newClicks = Math.abs(update.ProductionCounter - last.ProductionCounter);
                            currentClicks += newClicks;


                        } else {
                            // end and start a new range
                            // Increment time
                            newDiff = Math.abs(update.createdAt - last.createdAt);
                            currentTime += newDiff;

                            // Increment clicks
                            newClicks = Math.abs(update.ProductionCounter - last.ProductionCounter);
                            currentClicks += newClicks;


                            // End the last one since this is new
                            ranges.push({
                                statusDetails: last.StatusDetails,
                                id: last._id,
                                elapsedClicks: currentClicks,
                                diffMs: currentTime,
                                diffSec: currentTime / 1000,
                                diffMin: currentTime / 1000 / 60,
                                start: last.createdAt.getTime(),
                                //end: last.createdAt,
                                updates: currentRange.length,
                                press: press
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

                winston.log('info', {
                    press: press,
                    updates: updates.length,
                    ranges: ranges.length,
                    totalRemoved: totalRemoved
                });

                if (ranges.length > 0) {
                    //model.postRanges(ranges, updatesToDelete);
                    callback(ranges, updatesToDelete);
                    //console.log(ranges);
                }

            });
        });
    };

    model.postRanges = function (ranges, updatesToDelete, callback) {

        request(range_endpoint,
            {json: true, body: {ranges: ranges}},
            function (err, res, body) {
                // `body` is a js object if request was successful

                if (!err && res.statusCode == 200) {
                    // Need to delete updates which have been logged as ranges
                    updatesToDelete.forEach(function (updateRange) {
                        updateRange.forEach(function (id) {
                            // Delete from data store
                            db.remove({_id: id}, {}, function (err, numRemoved) {
                                // numRemoved = 1
                                if (err) {
                                    winston.log('error', {removal_error: err});
                                }
                            });
                        });
                    });
                    //console.log(body);

                } else {
                    winston.log('error', {
                        status_code: res.statusCode,
                        body: res.body
                    });
                    //console.log(res);
                }

                callback();
            });
    };
};

module.exports = Interpreter;