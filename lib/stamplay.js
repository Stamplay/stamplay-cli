var pkg = require('../package.json')
  , App = require('./app')
  , updateNotifier = require('update-notifier')
  , chalk = require('chalk')


/**
 *	Stamplay constructor
 */
function Stamplay(){
  this.version = pkg.version || 0
  this.name = pkg.name || 'stamplay-cli'
  this.path = process.cwd()
  this.config = undefined
  _checkUpdate()
}


/**
 *	Download new app folder based on app's credentials
 */
Stamplay.prototype.download = function(argv) {
  var app = new App()
  var schema = app.getCredentialsSchema()
  app.askToUser(schema, function(){
    app.downloadFolder(argv)
  })
}

/**
 *	Upload app folder
 **/
Stamplay.prototype.deploy = function(argv) {
  var app = new App()
  app.readStamplayJson(this.path, this.config)
  var comment = _detectComment(argv)
  app.uploadFolder(comment)
}


/**
 *  Run local server to try the app locally
 */
Stamplay.prototype.start = function(argv) {
  var app = new App()
  app.readStamplayJson(this.path, this.config)
  app.startLocalServer(argv)
}


/**
 *  Opens the URL of the current app in a browser.
 */
Stamplay.prototype.open = function(argv) {
  var app = new App()  
  app.readStamplayJson(this.path, this.config)
  app.openInBrowser()
}


/**
 *  Init new local project
 */
Stamplay.prototype.init = function(argv) {
  var app = new App()
  app.init(this.path, argv)
}


/**
 *  Restore previously deployed version
 */
Stamplay.prototype.rollback = function() {
  var app = new App()
  app.readStamplayJson(this.path, this.config)
  app.selectVersion(app.switchToVersion.bind(app))
}


/**
 *  Set a configuration for grunt/gulp task
 */
Stamplay.prototype.setConfiguration = function(config){
  this.config = config
}


/**
 *  Check if there is new package version
 */
function _checkUpdate(){
  var notifier = updateNotifier({
    pkg: pkg,
    updateCheckInterval: 1000 * 60 * 60 * 24 * 7
  })
  if (notifier.update)
    notifier.notify()
}


/**
 *  Detect if the option -m is present in the command
 */
function _detectComment(argv){
  var comment = ''
  if(argv._.length == 1){
    if(argv.m && typeof argv.m == 'string') comment = argv.m
    else if (argv.message && typeof argv.message == 'string') comment = argv.message
    return comment
  } else {
    console.log(chalk.red.bold('Invalid command: use stamplay deploy -m "YOUR MESSAGE"'))
    process.exit(1)
  }
}


module.exports = new Stamplay()
