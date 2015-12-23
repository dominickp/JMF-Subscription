var argv = require('yargs')
    .usage('Usage: $0 --action [action]')
    .demand(['action'])
    .argv;
var Datastore = require('nedb'),
    db = new Datastore({ filename: __dirname + '/../../db/server.db', timestampData: true, autoload: true });

if(argv.action == 'interpreter'){

    argv = require('yargs')
        .usage('Usage: $0 --range-endpoint [url]')
        .demand(['range-endpoint'])
        .argv;

    var Interpreter = require("./interpreter");
    var interpreter = new Interpreter(db, argv);
    interpreter.init();
}


