var express = require('express')
  , http = require('http')
  , httpProxy = require('http-proxy')
  , fs = require('fs')
  , path = require('path')


function HttpServer(appId, public_folder, argv){
	this.app = express()
	this.appId = appId
	this.public_folder = public_folder
	this.spa_mode = argv.spa

	if (this.spa_mode){
		this.app.use(_detectSpaUrl)
	}

	this.app.use(express.static(public_folder))
	this.app.use(this.app.router)
	this.app.use(function(req, res, next){
		if(req.url != '/404.html')
			res.redirect('404.html')
		else
			res.sendfile(path.join(__dirname, './default_404.html'))
	})

	this.proxy = httpProxy.createProxyServer()
	this.proxy.on('error', function(err, req, res){
		res.end()
	})
	

	this.setupRouter()
	this.start()
}

HttpServer.prototype.setupRouter = function() {
	var _this = this
	var host = this.appId + '.stamplayapp.com'
	this.app.all(/^(\/api\/.*)/, function(req, res){
		req.headers.host = host
		_addSdkHeader.call(_this, req)
		_this.proxy.web(req, res, { target: 'https://'+host })
	})

	this.app.all(/^(\/auth\/.*)/, function(req, res){		
		var localHost = req.headers.host
		req.headers.host = host
		_addSdkHeader.call(_this, req)
		_addSocialLoginHeader.call(_this, req, localHost)
		_this.proxy.web(req, res, { target: 'https://'+host })
	})
}

var _addSdkHeader = function(req) {
	if(req.headers['stamplay-app']){
		req.headers['stamplay-app'] = this.appId
	}
}


var _addSocialLoginHeader = function(req, localHost) {
	req.headers['x-local-host'] = localHost
}


HttpServer.prototype.start = function() {
	var _this = this
	http.createServer(this.app).listen(8080, function (req, res) {
	  console.log('Server running with ' + _this.public_folder + ' as public folder at the following address http://localhost:8080')
	})
}


function _detectSpaUrl(req, res, next){
	var isHome = req.url.match(/\/$/)
	var hasExtention = req.url.match(/\.([^\.]+)$/)
	var isNotFound = req.url.match(/\/404$|\/404\.html$/)
	var isApi = req.url.match(/^(\/api\/.*)/)
	var isAuth = req.url.match(/^(\/auth\/.*)/)
	
	if(hasExtention || isNotFound || isHome || isApi || isAuth){
		next()
	} else {
		req.url = '/index.html'
		next()
	}
}


module.exports = HttpServer