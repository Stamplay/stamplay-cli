var assert = require("assert"),
	sinon = require('sinon'),
	help = require('../../lib/help'),
	path = require('path'),
	exec = require('child_process').exec;

var lastEnterChar = new RegExp('\n$');
var stamplay_bin = path.join(__dirname, '../../', '/bin/stamplay');

describe('Stamplay cli help command', function () {

	it('stamplay', function (done) {
		exec(stamplay_bin, function (error, stdout, stderr) {
			var spiedConsoleLog = sinon.spy(console, 'log');
			help.showHelp();
			var helpString = spiedConsoleLog.args[0][0] + '\n' + spiedConsoleLog.args[1][0];
			stdout = stdout.replace(lastEnterChar, '');
			
			assert(spiedConsoleLog.calledTwice);
			assert.equal(error, null);
			assert.equal(stderr, '');
			assert.equal(stdout, helpString);

			spiedConsoleLog.restore();
			done();	
		})
	})

	it('stamplay -h', function (done) {
		exec(stamplay_bin + ' -h', function (error, stdout, stderr) {
			var spiedConsoleLog = sinon.spy(console, 'log');
			help.showHelp();
			var helpString = spiedConsoleLog.args[0][0] + '\n' + spiedConsoleLog.args[1][0];
			stdout = stdout.replace(lastEnterChar, '');
			
			assert(spiedConsoleLog.calledTwice);
			assert.equal(error, null);
			assert.equal(stderr, '');
			assert.equal(stdout, helpString);

			spiedConsoleLog.restore();
			done();	
		})
	})
})