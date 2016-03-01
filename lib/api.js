var request = require('request')
  , fs = require('fs')
  , path = require('path')
  , stream_ignore = require("fstream-ignore")
  , pump = require('pump')
  , tar = require('tar-fs')
  , chalk = require('chalk')
  , minimatch = require("minimatch")
  , zlib = require('zlib')
    

/**
 *  ApiRequest constructor
 *
 *  @param appId          {String}
 *  @param apiKey         {String}
 *  @param filesToIgnore  {Array}
 *  @param options        {Object}
 */
function ApiRequest(appId, apiKey, filesToIgnore, options){
  this.url = 'https://cli.stamplayapp.com'
  this.appId = appId
  this.apiKey = apiKey
  this.filesToIgnore = filesToIgnore

  if (options && options.proxy)
    this.proxy = _validateProxyAddress(options.proxy)
}


/**
 *  Download app folder from the server and save it on the local path
 *
 *  @param  callback  {Function}
 */
ApiRequest.prototype.downloadFolder = function(callback) {
  var celeri = require('celeri')
  var options = this.getRequestOptions('GET', '/download')
  var _this = this
  var gunzip = zlib.createGunzip()
  var extract = tar.extract('./'+this.appId)
  var spinner = celeri.loading('Downloading your app...')

  request(options).on('response', function(res){
    var headers
    if (res.headers['custom-headers']) {
      try {
        var received = new Buffer(res.headers['custom-headers'], 'base64');
        var unzipped = zlib.inflateSync(received)
        headers = JSON.parse(unzipped)
      } catch (e) {
        console.log(chalk.red.bold(err.message))
      }
    }
    
     // Res stream transformations and gzip extraction
    pump(res, gunzip, extract, function(err){
      if (err) {
        console.log(chalk.red.bold(err.message))
        spinner.done(false)
        process.exit(1)
      } else {
        spinner.done()
        callback(headers)
        console.log(chalk.green.bold('Download completed, your app is in ' + process.cwd() + '/' + _this.appId + '!'))
        process.exit(1)
      }
    })  
  }).on('error', function(e){
    console.log(chalk.red.bold(e.message))
  })
}
   

/**
 *  Deploy new app version
 *
 *  @param  path     {String}
 *  @param  comment  {String}
 */
ApiRequest.prototype.uploadFolder = function(path, comment, custom_headers) {
  comment = encodeURIComponent(comment)
  var celeri = require('celeri')
  var appId = this.appId
  var spinner = celeri.loading('Preparing deploy for app ' + appId + '...')
  var files = {count : 0}
  var tar_stream = tar.pack(path, {
    ignore:_ignore.call(this, files, path)
  })
  var options = this.getRequestOptions('POST', '/deploy?comment='+comment, false, custom_headers)
  
  var gzip = zlib.createGzip()

  var req = request(options).on('response', function(res){
    var ack = 0
    var new_progress = 0
    var already_show = false
    spinner.done()

    res.on('data', function(chunk){
      var tmp_res = parseInt(chunk.toString())
      if (isNaN(tmp_res)) _errorEventFunction.call(this, spinner)({message: chunk.toString()})
      else {
        ack += tmp_res
        var tmp_progress = Math.ceil((ack / files.count) * 100)
        if (tmp_progress > new_progress && new_progress < 100) {
          new_progress = tmp_progress
          celeri.progress('Uploading app ' + appId +  ': ', new_progress)
        }
        if (new_progress >= 100 && !already_show) {
          console.log(chalk.green('Switching your app in production...'))
          already_show = true
        }
      }
    })

    res.on('end', function(){
      console.log(chalk.green.bold('Deploy completed!'))
      process.exit(1)
    })

  })
  
  req.on('error', _errorEventFunction.call(this, spinner))

  // Trasfer tar_stream in request
  pump(tar_stream, gzip, req, function(err){
    if (err) _errorEventFunction.call(this, spinner)({message: err})
    else req.end()
  })
  
}


/**
 *  Check if the credentials are correct
 *
 *  @param  callback  {Function}
 */
ApiRequest.prototype.checkCredentials = function(callback) {
  var options = this.getRequestOptions('GET', '/credentials')
  
  request(options, function (error, response, body) {
    if (error) console.log(chalk.red.bold('Error : ' + error.message))
    else {
      if (response.statusCode == 200){
        callback()
      } else {
        console.log(chalk.red.bold('Error : ' + body.toString()))
        process.exit(1)
      }
    }
  }).on('error', function(e){
    console.log(chalk.red.bold(e.message))
  })
}


/**
 *  Make an api request and return the list of app's versions
 *
 *  @param  callback  {Function}
 */
ApiRequest.prototype.getVersionsList = function(callback) {
  var options = this.getRequestOptions('GET', '/versions')
  
  request(options, function (error, response, body) {
    if (error) console.log(chalk.red.bold('Error : ' + error.message))
    else {
      if (response.statusCode == 200){
        var versions = JSON.parse(body).data
        callback(versions)
      } else {
        console.log(chalk.red.bold('Error : ' + body.toString()))
        process.exit(1)
      }
    }
  }).on('error', function(e){
    console.log(chalk.red.bold(e.message))
  })
}


/**
 *  Make an api request to switch the current app to a specify version
 *
 *  @param  version  {String}
 */
ApiRequest.prototype.rollbackToVersion = function(version){
  var options = this.getRequestOptions('POST', '/rollback', true)
  options.body = {version : version}
  var celeri = require('celeri')
  var spinner = celeri.loading('Rollback to ' + version + ' in progress...')

  request(options, function (error, response, body) {
    if (error) console.log(chalk.red.bold('Error : ' + error.message))
    else {
      if (response.statusCode == 200){
        spinner.done()
        console.log(chalk.green.bold('Rollback to version ' + version + ' completed '))
        process.exit(1)
      } else {
        console.log(chalk.red.bold('Error : ' + body.toString()))
        spinner.done(false)
        process.exit(1)
      }
    }
  }).on('error', function(e){
    console.log(chalk.red.bold(e.message))
  })
}


/**
 *  Get http request options
 *
 *  @param  method  {String}
 *  @param  path    {String}
 *  @param  json    {Boolean}
 */
ApiRequest.prototype.getRequestOptions = function(method, path, json, custom_headers) {
  var options = {}
  options.url = this.url + path
  options.method = method
  options.headers = {}
  options.headers.authorization = 'Basic ' + new Buffer(this.appId + ':' + this.apiKey).toString('base64')

  if (json){
    options.json = true
  }

  if (this.proxy) {
    options.proxy = this.proxy
  }

  if (custom_headers){
    console.log(JSON.stringify(custom_headers))
    options.headers['custom-headers'] = zlib.deflateSync(JSON.stringify(custom_headers)).toString('base64')
  }

  return options
}


function _ignore(files, basePath){
  var _this = this
  var basePath = basePath + '/'

  return function(name){
    name = name.replace(basePath, "")
    files.count++
    var toIgnore = false
    _this.filesToIgnore.forEach(function(fileExp){
      try {
        if (minimatch(name, fileExp)){
          toIgnore = true
          files.count--
        }
      } catch(e){
        console.log(chalk.red.bold('Invalid expression ' + fileExp ))
        process.exit(1)
      }
    }) 
    return toIgnore
  }
}


function _errorEventFunction(spinner){
  return function(err){
    spinner.done(false)
    console.log(chalk.red.bold('Error during deploy : '+ err.message))
    process.exit(1)
  }
}


function _validateProxyAddress(address){
  if (typeof address !='string') {
    console.log(chalk.red.bold('Proxy must be a string, for example http://myproxyaddress:8080'))
    process.exit(1)
  }
  else {
    return address
  }
}


module.exports = ApiRequest