var assert = require("assert"),
	conf = require('../package.json'),
	sinon = require('sinon'),
	App = require('../lib/app'),
	stamplay = require('../lib/stamplay');

suite('stamplay.js', function () {


	test('properties from package.json', function () {
		assert.equal(stamplay.version, conf.version);
		assert.equal(stamplay.name, conf.name);
	});


	test('addApp method', function (done) {
		var spy = sinon.spy(App.prototype, "getCredentialsSchema");

		sinon.stub(App.prototype, "askToUser", function (schema, cb) {
			assert(spy.calledOnce);
			assert.equal(Object.keys(schema.properties).length, 2);
			cb();
		});

		sinon.stub(App.prototype, "downloadFolder", function () {
			done();
		});

		stamplay.addApp();
	});

})