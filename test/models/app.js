var App = require('../../lib/app'),
		assert = require('assert'),
		rmdir = require('rimraf'),
		fs = require('fs'),
		sinon = require('sinon'),
		path = require('path')

var appId = 'clitest';
var apiKey = 'c4300c0c4c0df03e9fbaae97e53f297347fcd5d7b44811c2025dd52fd2f45843';
var fixtures_folder = path.join(__dirname, '../', '/fixtures');


describe('Test on App model', function(){
	
	before(function(done){
		var data = {};
		data.appId = appId;
		data.apiKey = apiKey;
		data.public = './';
		data.ignore = ["stamplay.json", "**/.*", "**/node_modules/**"];
		var dataString = JSON.stringify(data, null, 2) + '\n';
		rmdir(fixtures_folder, function(){
			fs.mkdir(fixtures_folder, function(){
  			fs.writeFile(fixtures_folder + '/stamplay.json', dataString, function(){
  				fs.writeFile(fixtures_folder + '/index.html', '<h1>test</h1>', function(){
  					done();
  				})
  			})
  		})
		})
	})

	it('App constructor', function(){
		var app = new App();
		assert.equal(app.hostingUrl, "https://stamplayapp.com");
		assert.equal(app.appId, undefined);
		assert.equal(app.apiKey, undefined);
		assert.equal(app.public_folder, undefined);
		assert.equal(app.ignore, undefined);
	});

	it('Method : getCredentialsSchema', function(){
		var app = new App();
		var schema = app.getCredentialsSchema();
		assert.equal(Object.keys(schema.properties).length, 2);
		assert.equal(schema.properties.appId.required, true);
		assert.equal(schema.properties.appId.description, 'Enter your appId:');
		assert.equal(schema.properties.appId.message, 'AppId must be only letters, numbers or dashes.');
		assert.equal(schema.properties.apiKey.required, true);
		assert.equal(schema.properties.apiKey.description, 'Enter your apiKey:');
		assert.equal(schema.properties.apiKey.message, 'ApiKey must be only letters, numbers or dashes.');
	});

	it('Method : getCommentSchema', function(){
		var app = new App();
		var schema = app.getCommentSchema();
		assert.equal(Object.keys(schema.properties).length, 1);
		assert.equal(schema.properties.comment.required, true);
		assert.equal(schema.properties.comment.type, 'string');
		assert.equal(schema.properties.comment.description, 'Insert a comment for your version:');
		assert.equal(schema.properties.comment.message, 'Comment must be a string.');
	});

	it('Method : existsIndexInPublicFolder (no index.html)', function(){
		var app = new App();
		app.public_folder = './';
		var exists = app.existsIndexInPublicFolder();
		assert.equal(exists, false);
	});

	it('Method : existsIndexInPublicFolder', function(){
		var app = new App();
		app.public_folder = fixtures_folder;
		var exists = app.existsIndexInPublicFolder();
		assert.equal(exists, true);
	});

	it('Method : createStamplayJson', function(){
		fs.unlinkSync(fixtures_folder + '/stamplay.json')
		var app = new App(appId, apiKey);
		var exists = app.createStamplayJson(fixtures_folder);
		assert.equal(fs.existsSync(fixtures_folder + '/stamplay.json'), true);
		var stamplay_json = require(fixtures_folder + '/stamplay.json');
		assert.equal(stamplay_json.appId, appId);
		assert.equal(stamplay_json.apiKey, apiKey);
		assert.equal(stamplay_json.public, './');
		assert.equal(stamplay_json.ignore.length, 3);
	});

	it('Method : readStamplayJson', function(){
		var app = new App(appId, apiKey);
		app.readStamplayJson(fixtures_folder);
		assert.equal(app.appId, appId);
		assert.equal(app.apiKey, apiKey);
		assert.equal(app.public_folder, './');
		assert.equal(app.ignore.length, 3);
	});
})