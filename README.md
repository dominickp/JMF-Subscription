# JMF-Subscription
If you want to get some information from your Indigo/DFE, you can always send it a JMF. But if you are actively monitoring the status of the device, you're better off with a JMF subscription which will notify an HTTP endpoint when something changes. Below you'll find an example on how to implement a basic JMF subscription endpoint using Node.

## Interface
For now, interface.js is the endpoint for CLI operations. You have to specify an --action, described below. 

## subscribe
Use this script to search and subscribe to your JMF devices. Takes two arguments. '--idp' is the URL to your IDP worker (on your DFE) and should end with /jmf/. '--server' is the IP and port of your JMF server (see server.js).

```
dominick$ node src/js/interface.js --action=subscribe --idp http://192.168.1.40:8080/dpp/jmf/ --server http://192.168.1.70:9090
info: Found Device ID: 192.168.1.45
info: Found Device ID: HP-Indigo-BUDPB
info: 2 two presses found.
info:  http=http://192.168.1.40:8080/dpp/jmf/192.168.1.45
info:  http=http://192.168.1.40:8080/dpp/jmf/HP-Indigo-BUDPB
info:  result=HP-Indigo-BUDPB subscribed successfully.
info:  result=192.168.1.45 subscribed successfully.
```

## server
This simple server opens a port and listens for subscription events from the JMF devices. Takes one argument. '--port' is the port the server should listen on.

```
dominick$ node src/js/interface.js --action=server --port=9090
Server listening on: http://localhost:9090
info:  DeviceID=HP-Indigo-BUDPB, DeviceStatus=Running, StatusDetails=Indigo: Printing, ProductionCounter=49942091
info:  DeviceID=HP-Indigo-BUDPB, DeviceStatus=Running, StatusDetails=Indigo: Printing, ProductionCounter=49942098
info:  DeviceID=HP-Indigo-BUDPB, DeviceStatus=Running, StatusDetails=Indigo: Printing, ProductionCounter=49942109
info:  DeviceID=HP-Indigo-BUDPB, DeviceStatus=Idle, StatusDetails=Indigo: Ready, ProductionCounter=49942109
info:  DeviceID=192.168.1.45, DeviceStatus=Idle, StatusDetails=Indigo: Ready, ProductionCounter=35089299
info:  DeviceID=192.168.1.45, DeviceStatus=Running, StatusDetails=Indigo: Printing, ProductionCounter=35089299

```

The server also saves the JMF details in a simple nebd database. You can use pm2 to start the server on boot.

## interpreter
This script reads the JMF updates from the server above from the database and converts them to usable time ranges that can be reported upon. It also posts those ranges in a JSON request to another endpoint and if successful, deletes them from the local data store. It will always leave the last update so the next range has something to start with. Takes one argument. '--range-endpoint' is the URI of the endpoint that accepts the ranges.

```
dominick$ node src/js/interface.js --action=interpreter --range-endpoint=http://insight.dev/switch-api/jmf-spy/add-ranges
[ '192.168.1.45': 1, 'HP-Indigo-BUDPB': 1 ]
info:  press=192.168.1.45, updates=563, ranges=178, totalRemoved=561
info:  press=HP-Indigo-BUDPB, updates=276, ranges=165, totalRemoved=275

```

Here is an example HTTP request the interpreter would send to the range-endpoint:

```
{"ranges":[ 
    
    { "statusDetails": "Indigo: Ready",
    "elapsedClicks": 0,
    "diffMs": 60000,
    "start": 1452006000000,
    "end": 1452006060000,
    "press": "HP-Indigo-BUDPB" }
    ]
}
```

You'll want to run the interpreter in an interval using something like cron, like so:

```
*/30 * * * * node /var/node/JMF-Subscription/src/js/interface.js --action=interpreter --range-endpoint=http://insight.dev/switch-api/jmf-spy/add-ranges >/dev/null 2>&1
```

## Reporting Example
Here are some example reports you can use this data for. You'll have to put these together yourself.

![Hours printing per day](https://i.imgur.com/38bRPFB.png)
<img src="https://i.imgur.com/vTWFxxh.png" width="200">
<img src="https://i.imgur.com/2bZAJDD.png" width="440">

## Info
For more information, see this post for now: http://forum.enfocus.com/viewtopic.php?f=13&t=761

## Todo
- Cancel subscriptions
- Different type of subscriptions (QueueStatus)
