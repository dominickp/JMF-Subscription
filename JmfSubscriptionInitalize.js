// Require modules
var request = require('request').debug = true;
var winston = require('winston');

// Prepare log file
winston.add(winston.transports.File, { filename: 'logs/initialization_responses.log' });

// Set the headers
var http_headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/vnd.cip4-jmf+xml'
}

// Var
var idp_endpoint = 'http://192.168.1.40:8080/prodflow/jmf/HP-Indigo-BUDPB';
var jmf_subscription_server = 'http://192.168.1.70:9090';

var jmf_payload = '<?xml version="1.0" encoding="UTF-8"?><JMF xmlns="http://www.CIP4.org/JDFSchema_1_1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" SenderID="MIS System" TimeStamp="2006-04-19T15:04:33-07:00" Version="1.2"><Query ID="misb42ee80c31ff464f" Type="Status" xsi:type="QueryStatus"><Subscription URL="'+jmf_subscription_server+'" /><StatusQuParams DeviceDetails="Details" /></Query></JMF>';

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
        // Log the body of the response
        winston.info('Response', { body: response_body });


    } else {
        console.log(error);
        // Log the error
        winston.error('Error', { body: response_body });
    }
})

