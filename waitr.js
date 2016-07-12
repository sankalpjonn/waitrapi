// Required modules
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');
var compress = require('compression');
var databaseUri = process.env.DATABASE_URI || 'mongodb://localhost:27017/waitrtest'

var api = new ParseServer({
  databaseURI: databaseUri,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/api.js',
  appId: process.env.APP_ID || 'waitrtestappid',
  masterKey: process.env.MASTER_KEY || 'waitrtestmasterkey', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/waitr',  // Don't forget to change to https if needed
  javascriptKey: process.env.JAVASCRIPT_KEY || "waitrtestjskey",
  restAPIKey : process.env.RESTAPI_KEY || "waitrtestrestapikey"
});
var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": process.env.SERVER_URL || 'http://localhost:1337/waitr',
      "appId": process.env.APP_ID || 'waitrtestappid',
      "masterKey": process.env.MASTER_KEY || 'waitrtestmasterkey',
      "appName": "waitr"
    }
  ],
  "users": [
    {
      "user": process.env.DASHBOARD_USERNAME || 'waitruser',
      "pass": process.env.DASHBOARD_PASSWORD || 'waitr'
    }
  ]
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

app.use(compress({threshold:0}))

if(process.env.INSTANCE=="live")
{
  app.locals.newrelic = newrelic;
}
// Serve the Parse API on the /waitr URL prefix
// Serve the Parse dashboard on /dashboard URL prefix
var appServerMountPath = process.env.PARSE_MOUNT || '/waitr';
var webServerMountPath = process.env.PARSE_WEB_MOUNT || '/dashboard';
app.use(appServerMountPath, api);
app.use(webServerMountPath, dashboard);

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('waitr running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
