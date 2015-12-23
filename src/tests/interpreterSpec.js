describe("interpreter", function() {

    var interpreter;

    var Datastore = require('nedb'),
        test_db = new Datastore({ filename: __dirname + '/../tests/db/test.db', timestampData: true, autoload: true });

    beforeEach(function(){

        var Interpreter = require("./../js/interpreter");
        interpreter = new Interpreter(test_db, 'endpoint');

    });

    describe("findPresses", function() {

        var presses = [];

        beforeEach(function(done){
            interpreter.findPresses(function(found_presses){
                presses = found_presses;
                console.log(presses);
                done();
            });
        });

        it("should get some presses", function(){
            expect(presses.length).not.toBeNull();
            expect(Object.keys(presses).length).toBeGreaterThan(0);
        });

    });

});