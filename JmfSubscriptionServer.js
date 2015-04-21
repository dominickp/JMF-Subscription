// Require modules
var http = require('http');
var winston = require('winston');

// Prepare log file
winston.add(winston.transports.File, { filename: 'requests.log' });

// Lets define a port we want to listen to
const PORT=9090;

// We need a function which handles requests and send response
function handleRequest(request, response){ 
    
    var body = '';
     
    request.on('data', function (data) {
        body += data;
        console.log("Partial body: " + body);
    });
    request.on('end', function () {
        // Log the body of the request
        winston.info('Incoming Request', { url: request.url, body: body });
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
