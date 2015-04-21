var request = require('request').debug = true;

// Set the headers
var http_headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/vnd.cip4-jmf+xml'
}

// Var
var idp_endpoint = 'http://192.168.1.40:8080/prodflow/jmf/HP-Indigo-BUDPB';
var jmf_subscription_server = 'http://192.168.1.60:9090';


var jmf_payload = '<?xml version="1.0" encoding="UTF-8"?><JMF xmlns="http://www.CIP4.org/JDFSchema_1_1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" SenderID="MIS System" TimeStamp="2006-04-19T17:25:51-07:00" Version="1.2"><Query ID="misb4b04635d9f64c6e" Type="QueueStatus" xsi:type="QueryQueueStatus"><Subscription URL="'+jmf_subscription_server+'" /></Query></JMF>';

// Configure the request
var options = {
    url: idp_endpoint,
    method: 'POST',
    headers: http_headers,
    body: jmf_payload
}


// Start the request
require('request')(options, function (error, response, response_body) {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        console.log(response_body);
    } else {
        console.log(error);
    }
})

/*
require('request').post({
    uri:idp_endpoint,
    headers: http_headers,
    body:require('querystring').stringify(jmf_payload)
    },function(err,res,body){
        console.log(body);
        console.log(res.statusCode);
});
*/
