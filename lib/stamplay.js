var pkg = require('../package.json')
  , App = require('./app')
  , updateNotifier = require('update-notifier');


/**
 *	Stamplay constructor
 */
function Stamplay(){
  this.version = pkg.version || 0;
  this.name = pkg.name || 'stamplay-cli';
  _checkUpdate();
}


/**
 *	Download new app folder based on app's credentials
 */
Stamplay.prototype.addApp = function(argv) {
  var app = new App();
  var schema = app.getCredentialsSchema();
  app.askToUser(schema, function(){
    app.downloadFolder();
  });
};


/**
 *	Upload app folder
 **/
Stamplay.prototype.deploy = function(argv) {
  var app = new App();
  var path = process.cwd();
  app.readStamplayJson(path);
  app.uploadFolder();
};


/**
 *  Run local server to try the app locally
 */
Stamplay.prototype.start = function() {
  var app = new App();
  var path = process.cwd();
  app.readStamplayJson(path);
  app.startLocalServer();
};


/**
 *  Opens the URL of the current app in a browser.
 */
Stamplay.prototype.open = function(argv) {
  var app = new App();
  var path = process.cwd();  
  app.readStamplayJson(path);
  app.openInBrowser()
};


/**
 *  Init new local project
 */
Stamplay.prototype.init = function() {
  var app = new App();
  var path = process.cwd();
  app.init(path);
};


/**
 *  Check if there is new package version
 */
function _checkUpdate(){
  var notifier = updateNotifier({
    pkg: pkg,
    updateCheckInterval: 1000 * 60 * 60 * 24 * 7
  });
  if (notifier.update)
    notifier.notify();
}


module.exports = new Stamplay();