// Require modules
var request = require('request').debug = false;
var winston = require('winston');
var argv = require('yargs')
    .usage('Usage: $0 --idp [host] --server [ip:port]')
    .demand(['idp', 'server'])
    .argv;
var parseString = require('xml2js').parseString;

// Prepare log file
winston.add(winston.transports.File, { filename: 'logs/initialization_responses.log' });

// Set the headers
var http_headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/vnd.cip4-jmf+xml'
};

// Var
var application_name = 'JDF Spy';
var idp_worker = argv.idp; // http://192.168.1.40:8080/prodflow/jmf/
var jmf_server = argv.server; //http://192.168.1.70:9090
var devices = [];

// Start the request to find devices
var discoverDevices = function(){

    // Find presses
    var jmf_known_devices =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<JMF xmlns="http://www.CIP4.org/JDFSchema_1_1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" SenderID="'+application_name+'" TimeStamp="2006-04-19T14:48:12-07:00" Version="1.2">' +
        '<Query ID="JDFSpy_DiscoverDevices" Type="KnownDevices" xsi:type="QueryKnownDevices">' +
        '<DeviceFilter DeviceDetails="Brief" />' +
        '</Query>' +
        '</JMF>';

    // Configure the request
    var options = {
        url: idp_worker,
        method: 'POST',
        headers: http_headers,
        body: jmf_known_devices
    };

    require("request")(options, function (error, response, response_body) {
        if (!error && response.statusCode == 200) {
            // Log the body of the response
            //winston.info('Response', { body: response_body });

            // Attempt to parse the XML
            parseString(response_body, {trim: true, explicitChildren: true}, function (err, result) {

                var device_nodes = result.JMF.$$.Response[0].$$.DeviceList[0].$$.DeviceInfo;

                if(device_nodes){
                    // Get devices
                    device_nodes.forEach(function(device){
                        // Check that it is not the DFE itself
                        if(device.$.ProductionCounter){
                            devices.push(device.$.DeviceID);
                            winston.log('info', 'Found Device ID: '+device.$.DeviceID);
                        }
                    });
                }

                winston.log('info', devices.length+' two presses found.');

                // Subscribe
                subscribeDevices(devices);

            });

        } else {
            //console.log(error);
            // Log the error
            winston.error('Error', { body: response_body });
        }
    });
}(); // Execute

// Request to subscribe to devices
var subscribeDevices = function(devices){

    devices.forEach(function(device){

        var jmf_subscribe = '<?xml version="1.0" encoding="UTF-8"?>' +
            '<JMF xmlns="http://www.CIP4.org/JDFSchema_1_1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" SenderID="'+application_name+'" TimeStamp="2015-12-18T11:04:35-07:00" Version="1.4">' +
            '<Query ID="JDFSpy_Detail-'+device+'" Type="Status" xsi:type="QueryStatus">' +
            '<Subscription URL="'+jmf_server+'" />' +
            '<StatusQuParams DeviceDetails="Details" />' +
            '</Query>' +
            '</JMF>';

        //winston.log('info', { jdf: jmf_subscribe });

        // Configure the request
        var options = {
            url: idp_worker+device,
            method: 'POST',
            headers: http_headers,
            body: jmf_subscribe
        };

        winston.log('info', { http: idp_worker+device });

        require("request")(options, function (error, response, response_body) {
            if (!error && response.statusCode == 200) {
                // Log the body of the response (XML)
                //winston.info('Response', { body: response_body });

                // Attempt to parse the XML
                parseString(response_body, {trim: true, explicitChildren: true}, function (err, result) {

                    var subscribed = result.JMF.$$.Response[0].$.Subscribed;

                    if(subscribed === 'true'){
                        winston.log('info', {result: device+' subscribed successfully.'});
                    } else {
                        winston.log('error', {
                            result: device+' could not be subscribed to.',
                            body: result.JMF.$$.Response[0]
                        });
                    }
                });

            } else {
                //console.log(error);
                // Log the error
                winston.error('Error', { body: response_body });
            }
        });
    });

};