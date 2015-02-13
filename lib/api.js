var http = require('http')
  , fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , stream_ignore = require("fstream-ignore")
  , pump = require('pump')
  , tar = require('tar-fs')
  , chalk = require('chalk')
  , minimatch = require("minimatch")
  , zlib = require('zlib');
    

/**
 *  ApiRequest constructor
 *
 *  @param appId          {String}
 *  @param apiKey         {String}
 *  @param filesToIgnore  {Array}
 */
function ApiRequest(appId, apiKey, filesToIgnore){
  this.host = 'localhost';
  this.port = '3000';
  this.appId = appId;
  this.apiKey = apiKey;
  this.authorization_header = 'Basic ' + new Buffer(this.appId + ':' + this.apiKey).toString('base64');
  this.filesToIgnore = filesToIgnore;
}


/**
 *  Download app folder from the server and save it on the local path
 *
 *  @param  callback  {Function}
 */
ApiRequest.prototype.downloadFolder = function(callback) {
  var celeri = require('celeri');
  var options = this.getRequestOptions('GET', '/download');
  var _this = this;
  var gunzip = zlib.createGunzip();
  var extract = tar.extract('./'+this.appId)
  var spinner = celeri.loading('Downloading your app...');

  var req = http.request(options, function(res){
    
    // Res stream transformations and gzip extraction
    pump(res, gunzip, extract, function(err){
      if (err) {
        console.log(chalk.red.bold(err.message));
        spinner.done(false);
        process.exit(1);
      } else {
        spinner.done();
        callback();
        console.log(chalk.green.bold('Download completed, your app is in ' + process.cwd() + '/' + _this.appId + '!'));
        process.exit(1);
      }
    })
  });

  req.end();
}
   

/**
 *  Deploy new app version
 *
 *  @param  path     {String}
 *  @param  comment  {String}
 */
ApiRequest.prototype.uploadFolder = function(path, comment) {
  comment = encodeURIComponent(comment);
  var celeri = require('celeri'); 
  var appId = this.appId;
  var spinner = celeri.loading('Preparing deploy for app ' + appId + '...');
  var files = {count : 0};
  var tar_stream = tar.pack(path, {
    ignore:_ignore.call(this, files, path)
  });
  var options = this.getRequestOptions('POST', '/deploy?comment='+comment);
  var gzip = zlib.createGzip();

  var req = http.request(options, function(res){
    var ack = 0;
    var new_progress = 0;
    var already_show = false;

    spinner.done();
    res.on('data', function(chunk){
      var tmp_res = parseInt(chunk.toString());
      if (isNaN(tmp_res)) _errorEventFunction.call(this, spinner)({message: chunk.toString()})
      else {
        ack += tmp_res;
        var tmp_progress = Math.ceil((ack / files.count) * 100);
        if (tmp_progress > new_progress && new_progress < 100) {
          new_progress = tmp_progress;
          celeri.progress('Uploading app ' + appId +  ': ', new_progress);
        }
        if (new_progress >= 100 && !already_show) {
          console.log(chalk.green('Switching your app in production...'));
          already_show = true;
        }
      }
    })

    res.on('end', function(){
      console.log(chalk.green.bold('Deploy completed!'));
      process.exit(1);
    });

  });

  req.on('error', _errorEventFunction.call(this, spinner));

  // Trasfer tar_stream in request
  pump(tar_stream, gzip, req, function(err){
    if (err) _errorEventFunction.call(this, spinner)({message: chunk.toString()})
    else req.end();
  });
  
};


/**
 *  Check if the credentials are correct
 *
 *  @param  callback  {Function}
 */
ApiRequest.prototype.checkCredentials = function(callback) {
  var options = this.getRequestOptions('GET', '/credentials');
  var req = http.request(options, function(res){

    var data = '';
    res.on('data', function(chunk){
      data += chunk;
    })

    res.on('end', function(){
      if (res.statusCode == 200){
        callback();
      } else {
        console.log(chalk.red.bold('Error : ' + data.toString()));
        process.exit(1);
      }
    })
  });
  req.end();
};


/**
 *  Get http request options
 *
 *  @param  method  {String}
 *  @param  path    {String}
 */
ApiRequest.prototype.getRequestOptions = function(method, path) {
  var options = {};
  options.method = method;
  options.port = this.port;
  options.host = this.host;
  options.path = path;
  options.headers = {};
  options.headers.authorization = this.authorization_header;
  return options;
};


function _ignore(files, basePath){
  var _this = this;
  var basePath = basePath + '/';

  return function(name){
    name = name.replace(basePath, "");
    files.count++;
    var toIgnore = false;
    _this.filesToIgnore.forEach(function(fileExp){
      try {
        if (minimatch(name, fileExp)){
          toIgnore = true;
          files.count--;
        }
      } catch(e){
        console.log(chalk.red.bold('Invalid expression ' + fileExp ));
        process.exit(1);
      }
    }) 
    return toIgnore;
  }
}


function _errorEventFunction(spinner){
  return function(err){
    spinner.done(false);
    console.log(chalk.red.bold('Error during deploy : '+ err.message));
    process.exit(1);
  }
}

module.exports = ApiRequest;