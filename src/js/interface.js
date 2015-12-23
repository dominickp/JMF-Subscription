var argv = require('yargs')
    .usage('Usage: $0 --action [action]')
    .demand(['action'])
    .argv;


if(argv.action == 'interpreter'){
    var interpreter = require("./interpreter");
    interpreter.init();
}

