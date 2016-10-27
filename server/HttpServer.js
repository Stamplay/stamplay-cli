const express = require('express');
const http = require('http');
const httpProxy = require('http-proxy');
const path = require('path');
const detectSpaUrl = require('./utils/detectSpa');

function HttpServer(appId, public_folder, argv, local_port) {
  this.app = express();
  this.appId = appId;
  this.public_folder = public_folder;
  this.spa_mode = argv.spa;
  this.local_port = local_port;

  if (this.spa_mode) {
    this.app.use(detectSpaUrl);
  }

  this.app.use(express.static(public_folder));
  this.app.use(this.app.router);
  this.app.use(function (req, res, next) {
    if (req.url != '/404.html')
      res.redirect('404.html')
    else
      res.sendfile(path.join(__dirname, './default_404.html'))
  })

  this.proxy = httpProxy.createProxyServer()
  this.proxy.on('error', function (err, req, res) {
    res.end()
  })

  this.setupRouter()
  this.start()
}

HttpServer.prototype.setupRouter = function () {
  var _this = this
  var host = this.appId + '.stamplayapp.com'
  this.app.all(/^(\/api\/.*)/, function (req, res) {
    req.headers.host = host
    _addSdkHeader.call(_this, req)
    _this.proxy.web(req, res, {
      target: 'https://' + host
    })
  })

  this.app.all(/^(\/auth\/.*)/, function (req, res) {
    var localHost = req.headers.host
    req.headers.host = host
    _addSdkHeader.call(_this, req)
    _addSocialLoginHeader.call(_this, req, localHost)
    _this.proxy.web(req, res, {
      target: 'https://' + host
    })
  })
}

var _addSdkHeader = function (req) {
  if (req.headers['stamplay-app']) {
    req.headers['stamplay-app'] = this.appId
  }
}

var _addSocialLoginHeader = function (req, localHost) {
  req.headers['x-local-host'] = localHost
}

HttpServer.prototype.start = function () {
  var _this = this
  http.createServer(this.app).listen(this.local_port, function (req, res) {
    console.log('Server running with ' + _this.public_folder + ' as public folder at the following address http://localhost:' + _this.local_port)
  })
}

module.exports = HttpServer
