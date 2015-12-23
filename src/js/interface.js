var argv = require('yargs')
    .usage('Usage: $0 --action [action]')
    .demand(['action'])
    .argv;
var Datastore = require('nedb'),
    db = new Datastore({ filename: __dirname + '/../../db/server.db', timestampData: true, autoload: true });

if(argv.action === 'interpreter'){

    argv = require('yargs')
        .usage('Usage: $0 --range-endpoint [url]')
        .demand(['range-endpoint'])
        .argv;

    var Interpreter = require("./interpreter");
    var interpreter = new Interpreter(db, argv);
    interpreter.init();
}

if(argv.action === 'subscribe'){

    argv = require('yargs')
        .usage('Usage: $0 --idp [host] --server [ip:port]')
        .demand(['idp', 'server'])
        .argv;

    var Subscribe = require("./subscribe");
    var subscribe = new Subscribe(db, argv);
    subscribe.init();
}

if(argv.action === 'server'){

    argv = require('yargs')
        .usage('Usage: $0 --port [num]')
        .demand(['port'])
        .argv;

    var Server = require("./server");
    var server = new Server(db, argv);
    server.init();
}


