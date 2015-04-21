//Lets require/import the HTTP module
var http = require('http');
var winston = require('winston');

winston.add(winston.transports.File, { filename: 'requests.log' });

//Lets define a port we want to listen to
const PORT=9090;

//We need a function which handles requests and send response
function handleRequest(request, response){
    response.end('It Works!! Path Hit: ' + request.url);

    // Log it
    winston.info(request.body);
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});
