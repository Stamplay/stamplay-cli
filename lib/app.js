var prompt = require('prompt')
  , ApiRequest = require('./api')
  , fs = require('fs')
  , chalk = require('chalk')
  , error = chalk.bold.red
  , open = require('open')
  , util = require('util');

prompt.message = '';
prompt.delimiter = '';
prompt.colors = false;


/**
 *  App constructor
 */
function App(argv){
  this.appId = undefined;
  this.apiKey = undefined;
  this.public_folder = undefined;
  this.ignore = undefined;
  this.hostingUrl = "https://stamplayapp.com";
}


/**
 *  Create local server to test the app locally
 */
App.prototype.startLocalServer = function() {
  var Server = require('../server/HttpServer');
  var s = new Server(this.appId, this.public_folder);
  open('http://localhost:8080');
};


/**
 *  Make an api request to upload local dir
 */
App.prototype.uploadFolder = function() {
  var api_request = new ApiRequest(this.appId, this.apiKey, this.ignore);
  var exists_index = this.existsIndexInPublicFolder();
  var _this = this;
  api_request.checkCredentials(function(){
    if (exists_index){
      var schema = _this.getCommentSchema();
      _this.askToUser(schema, function(err, result){
        if (err) console.log(error(err));
        else api_request.uploadFolder(_this.public_folder, result.comment);
      })    
    }
    else {
      console.log(error('Missing index.html in your public folder ' + this.public_folder + ' please edit stamplay.json'));
      process.exit(1);
    }
  })
};



/**
 *  Opens the URL of the current app in a browser.
 */
App.prototype.openInBrowser = function() {
  open(this.hostingUrl.replace(/\/\//, util.format('//%s.', this.appId)));
};


/**
 *  Get prompt to insert app credentials
 */
App.prototype.askToUser = function(schema, callback) {
  var _this = this; 
  prompt.start();
  
  prompt.get(schema, function (err, result) {
    if (err) return;
    else {
      _this.appId = result.appId;
      _this.apiKey = result.apiKey;
      callback(err, result);
    }
  });
};


/**
 *  Make an api request to download app folder in local dir
 */
App.prototype.downloadFolder = function() {
	var api_request = new ApiRequest(this.appId, this.apiKey);
  var _this = this;
  
  api_request.checkCredentials(function(){
    api_request.downloadFolder(
      _this.createStamplayJson.bind(_this)
    );
  })
};


/**
 *  Create stamplay.json with app credentials
 */
App.prototype.readStamplayJson = function(path) {
  var json_path = path + '/stamplay.json';
  var exists_stamplay_json = fs.existsSync(json_path);
  if (!exists_stamplay_json){
    console.log(error('Error : missing stamplay.json file, are you sure that is the right directory?'));
    process.exit(1);
  } else {
    var stamplay_json = fs.readFileSync(json_path, {encoding : 'utf8'});
    try {
      stamplay_json = JSON.parse(stamplay_json);
      this.appId = stamplay_json.appId;
      this.apiKey = stamplay_json.apiKey;
      this.public_folder = stamplay_json.public;
      this.ignore = stamplay_json.ignore;
    } catch (err){
      console.log(error('Syntax error in stamplay.json : ' + err.message));
      process.exit(1);
    }
  }  
};


/**
 *  Initialize new app locally
 */
App.prototype.init = function(path) {
  var _this = this;
  var schema = this.getCredentialsSchema();
  this.askToUser(schema, function(){
    var api_request = new ApiRequest(_this.appId, _this.apiKey);
    api_request.checkCredentials(function(){
      try{
        fs.mkdirSync(path + '/' + _this.appId);
      } catch(e) {
        console.log(error('Error : ' + e.message));
        process.exit(1);
      }
      _this.createStamplayJson();
      console.log(chalk.green.bold('Folder has been created for your app ' + _this.appId));
      process.exit(1);
    });
  });
};


/**
 *  Create stamplay.json with app credentials
 */
App.prototype.createStamplayJson = function() {
  var path = process.cwd() + '/' + this.appId;
  var data = {};
  data.appId = this.appId;
  data.apiKey = this.apiKey;
  data.public = './';
  data.ignore = ["stamplay.json", "**/.*", "**/node_modules/**"];
  
  var dataString = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(path + '/stamplay.json', dataString);
};


/**
 *  Get creadentials prompt schema with fields validator
 */
App.prototype.getCredentialsSchema = function() {
	 var schema = {
    properties: {
      appId: {
        pattern: /^[a-z0-9\-]+$/,
        description: 'Enter your appId',
        message: 'AppId must be only letters, numbers or dashes',
        required: true
      },
      apiKey: {
        pattern: /^[a-z0-9\-]+$/,
        description: 'Enter your apiKey',
        message: 'ApiKey must be only letters, numbers or dashes',
        required: true
      },
    }
  };
  return schema;
};


/**
 *  Get comment prompt schema with fields validator
 */
App.prototype.getCommentSchema = function() {
   var schema = {
    properties: {
      comment: {
        type : 'string',
        description: 'Insert a comment for your version :',
        message: 'Comment must be a string',
        required: true
      }
    }
  };
  return schema;
};


/**
 *  Verify if exists index.html in public folder
 */
App.prototype.existsIndexInPublicFolder = function() {
  var folder = (this.public_folder[this.public_folder.length -1 ] == '/') ? this.public_folder : this.public_folder + '/';
  return fs.existsSync(folder + 'index.html'); 
};


module.exports = App;