// Require modules
//var http = require('http');
var winston = require('winston');
//var fs = require('fs');
var request = require('request');
var RangeAssembler = require('./range_assembler');

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

            //model.buildRanges(presses);
            callback(presses);

        });
    };

    model.buildRanges = function (presses, callback) {

        Object.keys(presses).forEach(function (press) {

            // Find one presses updates at a time
            db.find({DeviceID: press}).sort({createdAt: 1}).exec(function (err, updates) {
                // Set some starter variables


                var ranges = [];

                var updatesToDelete = [];

                var assembler = new RangeAssembler();



                // Loop through each update
                updates.forEach(function (update, index) {
                    //console.log(index);

                    //console.log(update);




                    if (index === 0) {

                        // First loop,  no basis for range
                        assembler.updates.push(update);

                        //console.log(assembler.updates);

                    } else {

                        // Now at least have an existing update
                        if(assembler.getFirstUpdate().StatusDetails === update.StatusDetails){
                            // Continue range
                            assembler.updates.push(update);

                        } else {
                            // End range
                            assembler.updates.push(update);


                            // Push into main array
                            var range = assembler.getRange();
                            ranges.push(range);

                            // Start new assembler
                            assembler = new RangeAssembler();

                            // This update becomes the start of the next range
                            assembler.updates.push(update);

                        }
                    }


                    // Never delete the last one
                    if(index !== (updates.length-1)){
                        updatesToDelete.push(update);
                    }



                });

                winston.log('debug', {
                    press: press,
                    updates: updates.length,
                    ranges: ranges.length,
                    totalRemoved: updatesToDelete.length
                });

                if (ranges.length > 0) {
                    //model.postRanges(ranges, updatesToDelete);
                    callback(ranges, updatesToDelete);
                }

            });
        });
    };

    model.postRanges = function (ranges, updatesToDelete, callback) {

        request(range_endpoint,
            {json: true, body: {ranges: ranges}},
            function (err, res) {
                // `body` is a js object if request was successful

                if (!err && res.statusCode === 200) {
                    // Need to delete updates which have been logged as ranges
                    updatesToDelete.forEach(function (updateRange) {
                        updateRange.forEach(function (id) {
                            // Delete from data store
                            db.remove({_id: id}, {}, function (err) {
                                // numRemoved = 1
                                if (err) {
                                    winston.log('error', {removal_error: err});
                                }
                            });
                        });
                    });
                } else {
                    winston.log('error', {
                        status_code: res.statusCode,
                        body: res.body
                    });
                }

                callback();
            });
    };
};

module.exports = Interpreter;