// Require modules
//var http = require('http');
var winston = require('winston');
//var fs = require('fs');
var request = require('request');
var RangeAssembler = require('./rangeAssembler');

var Interpreter = function (db, argv) {

    var model = this;

    var range_endpoint = argv["range-endpoint"];

    model.init = function(){
        // Prepare log file
        //winston.add(winston.transports.File, {filename: __dirname + '/logs/interpreter.log'});

        model.findPresses(function(presses){
            model.buildRanges(presses, function(ranges, assemblers){
                model.postRanges(ranges, assemblers, function(){
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
                var assemblers = [];
                var updatesToDelete = [];
                var assembler = new RangeAssembler();

                // Loop through each update
                updates.forEach(function (update, index) {

                    if (index === 0) {
                        // First loop, no basis for range
                        assembler.addUpdate(update);
                    } else {
                        // Now at least have an existing update
                        if(assembler.getFirstUpdate().StatusDetails === update.StatusDetails){
                            // Continue range
                            assembler.addUpdate(update);
                        } else {
                            // End range
                            assembler.addUpdate(update);

                            // Push into main array
                            var range = assembler.getRange();
                            ranges.push(range);
                            assemblers.push(assembler);

                            // Start new assembler
                            assembler = new RangeAssembler();

                            // This update becomes the start of the next range
                            assembler.addUpdate(update);
                        }
                    }

                    // Never delete the last one
                    if(index !== (updates.length-1)){
                        updatesToDelete.push(update); // need it do delete the correct amount
                        // only want to delete if it is a complete range, but never the last one
                        // Should be sending in an array of updates, not the updates themselves
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
                    callback(ranges, assemblers);
                }

            });
        });
    };

    model.postRanges = function (ranges, assemblers, callback) {

        var removed = 0;
        request(range_endpoint,
            {json: true, body: {ranges: ranges}},
            function (err, res) {
                // `body` is a js object if request was successful

                if (!err && res.statusCode === 200) {
                    // Need to delete updates which have been logged as ranges
                    assemblers.forEach(function(assembler, assemblersIndex) {
                        assembler.updates.forEach(function(update, updateIndex) {
                            // Delete from data store
                            // Check for last
                            if(assemblersIndex === (assemblers.length-1) && updateIndex === (assembler.updates.length-1)){
                                // Don't remove
                            } else {
                                db.remove({_id: update._id}, {}, function (err) {
                                    // numRemoved = 1
                                    if (err) {
                                        winston.log('error', {removal_error: err});
                                    } else {
                                        removed = removed+1;
                                        //console.log(numRemoved);
                                        //
                                        //if(removed === 13){
                                        //    db.find({}, function (err, updates) {
                                        //        updates.forEach(function(update){
                                        //            console.log(update._id, update.DeviceID, update.createdAt);
                                        //        });
                                        //    });
                                        //}
                                    }
                                });
                            }
                        });

                    });
                } else {
                    winston.log('error', {
                        status_code: res.statusCode,
                        body: res.body
                    });
                }

                callback(removed);

            });
    };
};

module.exports = Interpreter;