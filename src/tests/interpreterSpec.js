describe("interpreter", function() {

    var interpreter;

    var Datastore = require('nedb'), test_db = new Datastore({timestampData:true});

    beforeEach(function(){

        // Load some dummy data into the database
        test_db.insert([
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready", SignalID: "SJDFSpy_Detail-Press1",
                SignalType: "SignalStatus",ProductionCounter: 35098505, createdAt:new Date('December 17, 2015 03:24:00')},
            {DeviceID: 'Press1', DeviceStatus: "Running",StatusDetails: "Indigo: Printing", SignalID: "SJDFSpy_Detail-Press1",
                SignalType: "SignalStatus",ProductionCounter: 35092505, createdAt:new Date('December 17, 2015 03:44:00')},
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready", SignalID: "SJDFSpy_Detail-Press1",
                SignalType: "SignalStatus",ProductionCounter: 35098505, createdAt:new Date('December 17, 2015 03:24:00')},
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready", SignalID: "SJDFSpy_Detail-Press1",
                SignalType: "SignalStatus",ProductionCounter: 35098505, createdAt:new Date('December 17, 2015 03:24:00')},
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready", SignalID: "SJDFSpy_Detail-Press1",
                SignalType: "SignalStatus",ProductionCounter: 35098505, createdAt:new Date('December 17, 2015 03:24:00')}
        ], function (err, newDocs) {
            // Two documents were inserted in the database
            // newDocs is an array with these documents, augmented with their _id
        });

        var Interpreter = require("./../js/interpreter");
        interpreter = new Interpreter(test_db, 'endpoint');

    });

    var presses = [];

    describe("findPresses", function() {


        beforeEach(function(done){
            interpreter.findPresses(function(found_presses){
                presses = found_presses;
                done();
            });
        });

        it("should get some presses", function(){
            expect(presses.length).not.toBeNull();
            expect(Object.keys(presses).length).toBeGreaterThan(0);
        });

    });

    describe("buildRanges", function() {

        var ranges, updatesToDelete;

        beforeEach(function(done){

            interpreter.buildRanges(presses, function(foundRanges, foundUpdatesToDelete){

                ranges = foundRanges;
                updatesToDelete = foundUpdatesToDelete;
                done();
            });

        });

        it("should get some ranges", function(){
            expect(ranges).not.toBeNull();
            //expect(Object.keys(presses).length).toBeGreaterThan(0);
        });

    });

});