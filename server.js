var express = require('express');
var stormpath = require('express-stormpath');
var powerbi = require('powerbi-api');
var msrest = require('ms-rest');
var nconf = require('nconf');

nconf 
    .file({ file: './prod_config.json' })        // Included in repo
    .file({ file: './local_config.json' })  // Exists locally; not committed
    .env();                                 // environment vars

var accessKey = nconf.get("ACCESS_KEY");
var workspaceCollection = nconf.get("WORKSPACE_COLLECTION");
var workspaceId = nconf.get("WORKSPACE_ID");
var reportId = nconf.get("REPORT_ID");

var credentials = new msrest.TokenCredentials(accessKey, "AppKey");

var client = new powerbi.PowerBIClient(credentials);

var token = powerbi.PowerBIToken.createReportEmbedToken(workspaceCollection, workspaceId, reportId);

var jwt = token.generate(accessKey);

// Example API call
// client.workspaces.getWorkspacesByCollectionName(workspaceCollection, function(err, result) {
//     // Your code here
//     //console.log(result);
// });
 
var app = express();
 
app.set('views', './views');
app.set('view engine', 'jade');
 
app.use(stormpath.init(app, {
  expand: {
    customData: true
  }
}));
 
app.get('/', stormpath.getUser, function(req, res) {
  res.render('home', {
    title: 'Welcome',
    token: jwt,
    reportId: reportId
  });
});
 
app.on('stormpath.ready',function(){
  console.log('Stormpath Ready');
  app.use('/profile',stormpath.loginRequired,require('./profile')());
});
 
app.listen(3000);