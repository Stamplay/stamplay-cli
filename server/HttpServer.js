var express = require('express')
  , http = require('http')
  , httpProxy = require('http-proxy');

function HttpServer(appId, public_folder){
	this.app = express();
	this.appId = appId;
	this.public_folder = public_folder;
	this.app.use(express.static(public_folder));
	this.app.use(this.app.router);
	this.proxy = httpProxy.createProxyServer();
	this.proxy.on('error', function(err, req, res){
		res.end();
	})
	this.setupRouter();
	this.start();
}

HttpServer.prototype.setupRouter = function() {
	var _this = this;
	var host = this.appId + '.stamplayapp.com';
	this.app.all(/^(\/api\/.*)/, function(req, res){
		req.headers.host = host;
		_this.proxy.web(req, res, { target: 'http://'+host });
	});
	this.app.all(/^(\/auth\/.*)/, function(req, res){		
		req.headers.host = host;
		_this.proxy.web(req, res, { target: 'http://'+host });
	});
};


HttpServer.prototype.start = function() {
	var _this = this;
	http.createServer(this.app).listen(8080, function (req, res) {
	  console.log('Server running with ' + _this.public_folder + ' as public folder at the following address http://localhost:8080');
	});
}

module.exports = HttpServer;