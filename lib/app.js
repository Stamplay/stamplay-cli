var prompt = require('prompt')
  , ApiRequest = require('./api')
  , fs = require('fs')
  , chalk = require('chalk')
  , error = chalk.bold.red
  , open = require('open')
  , inquirer = require("inquirer")
  , util = require('util')

prompt.message = ''
prompt.delimiter = ''
prompt.colors = false


/**
 *  App constructor
 */
function App(appId, apiKey){
  this.appId = appId || undefined
  this.apiKey = apiKey || undefined
  this.public_folder = undefined
  this.ignore = undefined
  this.hostingUrl = "https://stamplayapp.com"
  this.options = {}
  this.headers = []
}


/**
 *  Create local server to test the app locally
 */
App.prototype.startLocalServer = function(argv) {
  var api_request = new ApiRequest(this.appId, this.apiKey, null, this.options)
  var _this = this

  api_request.checkCredentials(function(){
    var port = _detectLocalPort(argv)
    var local_port = (port) ? port : '8080'
    if (local_port != '8080') {
      var message = "Warning: in case you get CORS request errors you have to add 'localhost:[PORT]' in your Hosting -> Enabled CORS domain settings"
      console.log(chalk.bold.yellow(message))
    }
    var Server = require('../server/HttpServer')
    var s = new Server(_this.appId, _this.public_folder, argv, local_port)
    open('http://localhost:' + local_port)
  })
}


/**
 *  Make an api request to upload local dir
 */
App.prototype.uploadFolder = function(comment) {
  var api_request = new ApiRequest(this.appId, this.apiKey, this.ignore, this.options)
  var exists_index = this.existsIndexInPublicFolder()
  var _this = this

  api_request.checkCredentials(function(){
    if (exists_index){
      api_request.uploadFolder(_this.public_folder, comment, _this.headers)
    }
    else {
      console.log(error('Missing index.html in your public folder ' + _this.public_folder + ' please edit stamplay.json'))
      process.exit(1)
    }
  })
}


/**
 *  Make an api request to download app folder in local dir
 */
App.prototype.downloadFolder = function(argv) {
  var _this = this
  
  if(argv.proxy)
    this.options.proxy = argv.proxy
  
  var api_request = new ApiRequest(this.appId, this.apiKey, null, this.options)
  api_request.checkCredentials(function(){
    api_request.downloadFolder(function(headers){
      _this.createStamplayJson.call(_this, process.cwd() + '/' + _this.appId, argv, headers)
    }
    )
  })
}


/**
 *  Show to the user the list with app's versions and return the result
 */
App.prototype.selectVersion = function(callback) {
  var api_request = new ApiRequest(this.appId, this.apiKey, null, this.options)
  api_request.getVersionsList(function(list){
    var versions = []
    list = list.reverse()
    list.forEach(function(elem){
      var date = new Date(elem.dt_create)
      var dateString = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear()
      versions.push({value : elem.versionId, name :  elem.versionId + ' ('+ dateString +') - ' + elem.version})
    })
    inquirer.prompt({
      type : "list",
      message : "Select version: ",
      name : "version",
      choices : versions
    }, function(result){
      callback(result.version)
    })
  })
}


/**
 *  Make an api request to restore a specify app version
 *
 *  @param  version   {String}
 */
App.prototype.switchToVersion = function(version) {
  var api_request = new ApiRequest(this.appId, this.apiKey, null, this.options)
  api_request.rollbackToVersion(version)
}


/**
 *  Opens the URL of the current app in a browser.
 */
App.prototype.openInBrowser = function() {
  open(this.hostingUrl.replace(/\/\//, util.format('//%s.', this.appId)))
}


/**
 *  Get prompt to insert app credentials
 */
App.prototype.askToUser = function(schema, callback) {
  var _this = this 
  prompt.start()
  
  prompt.get(schema, function (err, result) {
    if (err) return
    else {
      _this.appId = result.appId
      _this.apiKey = result.apiKey
      callback(err, result)
    }
  })
}


/**
 *  Create stamplay.json with app credentials
 */
App.prototype.readStamplayJson = function(path, config) {
  var stamplay_json = null
  if (!config) {
    var json_path = path + '/stamplay.json'
    var exists_stamplay_json = fs.existsSync(json_path)
    if (!exists_stamplay_json){
      console.log(error('Error : missing stamplay.json file, are you sure that is the right directory?'))
      process.exit(1)
    } else {
      stamplay_json = fs.readFileSync(json_path, {encoding : 'utf8'})
    }
  } else {
    stamplay_json = JSON.stringify(config)
  }
  try {
    stamplay_json = JSON.parse(stamplay_json)
    this.appId = stamplay_json.appId
    this.apiKey = stamplay_json.apiKey
    this.public_folder = stamplay_json.public
    this.ignore = stamplay_json.ignore
    this.options.proxy = stamplay_json.proxy || false
    if (stamplay_json.headers) {
      validateCustomHeaders = require('./validator/headers')
      this.headers =  validateCustomHeaders(stamplay_json.headers)
    }
  } catch (err){
    console.log(error('Syntax error in stamplay.json : ' + err.message))
    process.exit(1)
  }  
}


/**
 *  Initialize new app locally
 */
App.prototype.init = function(path, argv) {
  var _this = this
  var schema = this.getCredentialsSchema()

  if(argv.proxy)
    this.options.proxy = argv.proxy

  this.askToUser(schema, function(){
    var api_request = new ApiRequest(_this.appId, _this.apiKey, null, _this.options)
    api_request.checkCredentials(function(){
      try{
        _this.createStamplayJson(process.cwd(), argv)
      } catch(e) {
        console.log(error('Error : ' + e.message))
        process.exit(1)
      }
      console.log(chalk.green.bold('Initialized Stamplay project ' + _this.appId))
      process.exit()
    })
  })
}


/**
 *  Create stamplay.json with app credentials
 */
App.prototype.createStamplayJson = function(path, argv, headers) {
  var data = {}
  data.appId = this.appId
  data.apiKey = this.apiKey
  data.public = './'
  data.ignore = ["stamplay.json", "**/.*", "**/node_modules/**"]
  
  if(argv.proxy)
    data.proxy = argv.proxy
  
  if (headers)
    data.headers = headers

  var dataString = JSON.stringify(data, null, 2) + '\n'
  fs.writeFileSync(path + '/stamplay.json', dataString)
}


/**
 *  Get creadentials prompt schema with fields validator
 */
App.prototype.getCredentialsSchema = function() {
	 var schema = {
    properties: {
      appId: {
        pattern: /^[a-z0-9\-]+$/,
        description: 'Enter your appId:',
        message: 'AppId must be only letters, numbers or dashes.',
        required: true
      },
      apiKey: {
        pattern: /^[a-z0-9\-]+$/,
        description: 'Enter your apiKey:',
        message: 'ApiKey must be only letters, numbers or dashes.',
        required: true
      },
    }
  }
  return schema
}


/**
 *  Verify if exists index.html in public folder
 */
App.prototype.existsIndexInPublicFolder = function() {
  var folder = (this.public_folder[this.public_folder.length -1 ] == '/') ? this.public_folder : this.public_folder + '/'
  return fs.existsSync(folder + 'index.html') 
}


function _detectLocalPort(argv){
  var port_parameter = undefined
  
  if (argv.p && argv.port) {
    console.log(error('Error: "p" parameter is an alias of "proxy" parameter, you must use only one of them'))
    process.exit(1)
  } else if (argv.p) {
    port_parameter = argv.p
  } else if (argv.port) {
    port_parameter = argv.port
  }

  if (port_parameter) {
    var validation = Number.isInteger(port_parameter)
    if (!validation) {
      console.log(error('Error: port parameter must be an integer'))
      process.exit(1)
    }  
  }
  
  return port_parameter
}

module.exports = App
