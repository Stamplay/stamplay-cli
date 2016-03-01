var	ApiRequest = require('../../lib/api'),
		assert = require('assert'),
		rmdir = require('rimraf'),
		fs = require('fs'),
		sinon = require('sinon'),
		path = require('path'),
		nock = require('nock')

var appId = 'clitest'
var apiKey = 'c4300c0c4c0df03e9fbaae97e53f297347fcd5d7b44811c2025dd52fd2f45843'
var authorization_header = 'Basic Y2xpdGVzdDpjNDMwMGMwYzRjMGRmMDNlOWZiYWFlOTdlNTNmMjk3MzQ3ZmNkNWQ3YjQ0ODExYzIwMjVkZDUyZmQyZjQ1ODQz'
var fixtures_folder = path.join(__dirname, '../', '/fixtures')

describe('Test on ApiRequest model', function(){
	
	before(function(done){
		var data = {}
		data.appId = appId
		data.apiKey = apiKey
		data.public = './'
		data.ignore = ["stamplay.json", "**/.*", "**/node_modules/**"]
		var dataString = JSON.stringify(data, null, 2) + '\n'
		rmdir(fixtures_folder, function(){
			fs.mkdir(fixtures_folder, function(){
  			fs.writeFile(fixtures_folder + '/stamplay.json', dataString, function(){
  				fs.writeFile(fixtures_folder + '/index.html', '<h1>test</h1>', function(){
  					done()
  				})
  			})
  		})
		})
	})

	it('App constructor', function(){
		var api = new ApiRequest(appId, apiKey, ['**/.*'])
		assert.equal(api.url, "https://cli.stamplayapp.com")
		assert.equal(api.appId, appId)
		assert.equal(api.apiKey, apiKey)
		assert.equal(api.filesToIgnore.length, 1)

	})

	it('Method : getRequestOptions', function(){
		var api = new ApiRequest(appId, apiKey, ['**/.*'])
		var options = api.getRequestOptions('POST', '/deploy')
		assert.equal(options.method, 'POST')
		assert.equal(options.url, 'https://cli.stamplayapp.com/deploy')
		assert.equal(Object.keys(options.headers).length, 1)
		assert.equal(options.headers.authorization, authorization_header)
	})

	it('Method : getRequestOptions with json response', function(){
		var api = new ApiRequest(appId, apiKey, ['**/.*'])
		var options = api.getRequestOptions('POST', '/deploy', true)
		assert.equal(options.method, 'POST')
		assert.equal(options.url, 'https://cli.stamplayapp.com/deploy')
		assert.equal(Object.keys(options.headers).length, 1)
		assert.equal(options.headers.authorization, authorization_header)
		assert.equal(options.json, true)
	})

	it('Method : getRequestOptions with custom headers', function(){
		var headers = [{
			source: '*.js',
			headers: [{
				key: 'cache-control',
				value: 'max-age=10'
			}]
		}]
		var api = new ApiRequest(appId, apiKey, ['**/.*'])
		var options = api.getRequestOptions('POST', '/deploy', false, headers)
		assert.equal(options.method, 'POST')
		assert.equal(options.url, 'https://cli.stamplayapp.com/deploy')
		assert.equal(Object.keys(options.headers).length, 2)
		assert.equal(options.headers.authorization, authorization_header)
		assert.equal(options.headers['custom-headers'], 'eJyLrlYqzi8tSk5VslLS0ssqVtJRykhNTEktKlayiq5Wyk6tBEokJyZnpOom5+eVFOXnAFWUJeaUgjTkJlboJqan2hoaKNXG1sYCALsBGOU=')
		
	})

	it('Method : checkCredentials', function(done){
		this.timeout(5000)
		var api = new ApiRequest(appId, apiKey, ['**/.*'])
		var options = api.checkCredentials(function(){
			done()
		})
	})

	it('Method : uploadFolder', function(done){
		this.timeout(4000)
		var scope = nock('https://cli.stamplayapp.com')
      .post('/deploy?comment=test')
      .reply(200)
		var api = new ApiRequest(appId, apiKey, ['**/.*'])
		api.uploadFolder(fixtures_folder, 'test')
		process.exit = function(code){
			if (code == 1) {
				assert.equal(code, 1)
				scope.isDone()
				done()
			}
		}
	})

	it('Method : downloadFolder', function(done){
		var scope = nock('https://cli.stamplayapp.com')
      .get('/download')
      .reply(200)
		var api = new ApiRequest(appId, apiKey, ['**/.*'])
		api.downloadFolder(function(){})
		process.exit = function(code){
			if (code == 1) {
				assert.equal(code, 1)
				scope.isDone()
				done()
			}
		}
	})

	it('Method : getVersionsList', function(done){
		var scope = nock('https://cli.stamplayapp.com')
      .get('/versions')
      .reply(200, {data:[{versionId:'v1'}]})
		var api = new ApiRequest(appId, apiKey, ['**/.*'])
		api.getVersionsList(function(data){
			scope.isDone()
			assert(data.length == 1)
			assert.equal(data[0].versionId, 'v1')
			done()
		})
	})

	it('Method : rollbackToVersion', function(done){
		var scope = nock('https://cli.stamplayapp.com')
      .post('/rollback',{version: 'v1'})
      .reply(200)
		var api = new ApiRequest(appId, apiKey, ['**/.*'])
		api.rollbackToVersion('v1')
		process.exit = function(code){
			if (code == 1){
				scope.isDone()
				done()
			}
		}
	})
})
