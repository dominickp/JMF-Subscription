// Require modules
var http = require('http');
var winston = require('winston');
var parseString = require('xml2js').parseString;
var util = require('util');
var argv = require('yargs')
    .usage('Usage: $0 --port [num]')
    .demand(['port'])
    .argv;



// Prepare log file
winston.add(winston.transports.File, { filename: 'logs/server_requests.log' });

// Lets define a port we want to listen to
const PORT=9090;

var port = argv.port;

// We need a function which handles requests and send response
function handleRequest(request, response){

    var body = '';

    request.on('data', function (data) {
        body += data;
        //console.log("Partial body: " + body);
    });

    request.on('end', function () {
        // Attempt to parse the XML
        parseString(body, {trim: true}, function (err, result) {
            // Log the body of the request
            //var jsonResult = JSON.parse(result);

            var fullResult = util.inspect(result, false, null);

            if(err){
                winston.error("Parse error" + err);
            }

            if(typeof result["JMF"]["Signal"][0]["DeviceInfo"] !== 'undefined'){
                winston.info('Subscription Update', {
                        DeviceID: result["JMF"]["Signal"][0]["DeviceInfo"][0]["$"]["DeviceID"],
                        DeviceStatus: result["JMF"]["Signal"][0]["DeviceInfo"][0]["$"]["DeviceStatus"],
                        StatusDetails: result["JMF"]["Signal"][0]["DeviceInfo"][0]["$"]["StatusDetails"],
                        ProductionCounter: result["JMF"]["Signal"][0]["DeviceInfo"][0]["$"]["ProductionCounter"]
                    }
                );
            }
            //winston.log('info', { body: result });

            // Log original XML string
            //console.log("Partial body: " + body);
        });

    });

    // Send a response
    response.end('It Works!! Path Hit: ' + request.url);
}

// Create a server
var server = http.createServer(handleRequest);

// Lets start our server
server.listen(PORT, function(){
    // Callback triggered when server is successfully listening
    console.log("Server listening on: http://localhost:%s", PORT);
});
