var assert = require("assert"),
	sinon = require('sinon'),
	help = require('../../lib/help'),
	path = require('path'),
	exec = require('child_process').exec;

var lastEnterChar = new RegExp('\n$');
var stamplay_bin = path.join(__dirname, '../../', '/bin/stamplay');

describe('Stamplay cli version command', function () {

	it('stamplay -v', function (done) {
		exec(stamplay_bin + ' -v', function (error, stdout, stderr) {
			var spiedConsoleLog = sinon.spy(console, 'log');
			help.showVersion();
			var helpString = spiedConsoleLog.args[0][0];
			stdout = stdout.replace(lastEnterChar, '');
		
			assert(spiedConsoleLog.calledOnce);
			assert.equal(error, null);
			assert.equal(stderr, '');
			assert.equal(stdout, helpString);

			spiedConsoleLog.restore();
			done();
		})
	})

	it('stamplay --version', function (done) {
		exec(stamplay_bin + ' -v', function (error, stdout, stderr) {
			var spiedConsoleLog = sinon.spy(console, 'log');
			help.showVersion();
			var helpString = spiedConsoleLog.args[0][0];
			stdout = stdout.replace(lastEnterChar, '');
		
			assert(spiedConsoleLog.calledOnce);
			assert.equal(error, null);
			assert.equal(stderr, '');
			assert.equal(stdout, helpString);

			spiedConsoleLog.restore();
			done();
		})
	})
})