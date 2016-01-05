describe("interpreter", function() {

    var interpreter;

    beforeEach(function(){

        var Datastore = require('nedb'), test_db = new Datastore({timestampData:true});

        // Load some dummy data into the database
        test_db.insert([
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35092505, createdAt:new Date('December 17, 2015 03:20:00')},
            {DeviceID: 'Press1', DeviceStatus: "Running",StatusDetails: "Indigo: Printing", SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35098505, createdAt:new Date('December 17, 2015 03:25:00')},
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35098505, createdAt:new Date('December 17, 2015 03:30:00')},
            {DeviceID: 'Press1', DeviceStatus: "Running",StatusDetails: "Indigo: Printing", SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35100505, createdAt:new Date('December 17, 2015 03:35:00')},
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35100605, createdAt:new Date('December 17, 2015 03:40:00')},
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35100605, createdAt:new Date('December 17, 2015 03:45:00')},
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35100605, createdAt:new Date('December 17, 2015 03:50:00')},
            {DeviceID: 'Press1', DeviceStatus: "Running",StatusDetails: "Indigo: Printing", SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35100605, createdAt:new Date('December 17, 2015 03:55:00')},
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35100705, createdAt:new Date('December 17, 2015 04:00:00')},
            {DeviceID: 'Press2', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press2", SignalType: "SignalStatus",ProductionCounter: 25092505, createdAt:new Date('December 17, 2015 03:20:00')},
            {DeviceID: 'Press2', DeviceStatus: "Running",StatusDetails: "Indigo: Printing", SignalID: "SJDFSpy_Detail-Press2", SignalType: "SignalStatus",ProductionCounter: 25098505, createdAt:new Date('December 17, 2015 03:25:00')},
            {DeviceID: 'Press2', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press2", SignalType: "SignalStatus",ProductionCounter: 25098505, createdAt:new Date('December 17, 2015 03:30:00')},
            {DeviceID: 'Press2', DeviceStatus: "Running",StatusDetails: "Indigo: Printing", SignalID: "SJDFSpy_Detail-Press2", SignalType: "SignalStatus",ProductionCounter: 25100505, createdAt:new Date('December 17, 2015 03:35:00')},
            {DeviceID: 'Press2', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press2", SignalType: "SignalStatus",ProductionCounter: 25100605, createdAt:new Date('December 17, 2015 03:40:00')},
            {DeviceID: 'Press2', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press2", SignalType: "SignalStatus",ProductionCounter: 25100605, createdAt:new Date('December 17, 2015 03:45:00')},
            {DeviceID: 'Press2', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press2", SignalType: "SignalStatus",ProductionCounter: 25100605, createdAt:new Date('December 17, 2015 03:50:00')},
            {DeviceID: 'Press2', DeviceStatus: "Running",StatusDetails: "Indigo: Printing", SignalID: "SJDFSpy_Detail-Press2", SignalType: "SignalStatus",ProductionCounter: 25100605, createdAt:new Date('December 17, 2015 03:55:00')},
            {DeviceID: 'Press2', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press2", SignalType: "SignalStatus",ProductionCounter: 25100705, createdAt:new Date('December 17, 2015 04:00:00')}
        ]);

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
            expect(Object.keys(presses).length).toBe(2);
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
            expect(ranges.length).toBe(6);
            //expect(Object.keys(presses).length).toBeGreaterThan(0);
        });

        it("should calculate elapsed time in milliseconds", function(){
            var mockedElapsedMsTimes = [300000,300000,300000,300000,900000,300000];
            ranges.forEach(function(range, index){
                expect(range.diffMs).toBe(mockedElapsedMsTimes[index]);
            });
        });

        it("should calculate elapsed time in seconds", function(){
            var mockedElapsedSecTimes = [300,300,300,300,900,300];
            ranges.forEach(function(range, index){
                expect(range.diffSec).toBe(mockedElapsedSecTimes[index]);
            });
        });

        it("should calculate elapsed time in minutes", function(){
            var mockedElapsedMinTimes = [5,5,5,5,15,5];
            ranges.forEach(function(range, index){
                expect(range.diffMin).toBe(mockedElapsedMinTimes[index]);
            });
        });

        it("should correctly calculate start and end times", function(){

            ranges.forEach(function(range, index){

                var timeTable = [
                    [1450340400000, 1450340700000],
                    [1450340700000, 1450341000000],
                    [1450341000000, 1450341300000],
                    [1450341300000, 1450341600000],
                    [1450341600000, 1450342500000],
                    [1450342500000, 1450342800000]
                ];

                if(timeTable.length > index){
                    expect(range.start).toBe(timeTable[index][0]);
                    expect(range.end).toBe(timeTable[index][1]);
                }

                // Start should be less than end
                expect(range.start).toBeLessThan(range.end);
            });
        });

    });

});