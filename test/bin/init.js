var assert = require("assert"),
	sinon = require('sinon'),
	help = require('../../lib/help'),
	path = require('path'),
	rmdir = require('rimraf'),
	fs = require('fs'),
	exec = require('child_process').exec;

var apiKey = 'c4300c0c4c0df03e9fbaae97e53f297347fcd5d7b44811c2025dd52fd2f45843';
var appId = 'clitest';
var lastEnterChar = new RegExp('\n$');
var stamplay_bin = path.join(__dirname, '../../', '/bin/stamplay');
var fixtures_folder = path.join(__dirname, '../', '/fixtures');

describe('Stamplay cli init command', function () {
	this.timeout(10000);
	
	beforeEach(function(done){
		rmdir(fixtures_folder, function(){
			fs.mkdir(fixtures_folder, function(){
				done();
			})
		})
	})

	it('stamplay init (invalid appId)', function (done) {
		this.timeout(2000);

		var terminal = require('child_process').spawn('bash');	
		var input = 0;
		
		terminal.stdout.on('data', function (data) {
		  var output = data.toString();
		  assert.equal(output, 'Enter your appId: ');
		  if (input == 1) done();
		  input++;
		});
		
		
		terminal.stdin.write('cd ' + fixtures_folder + ' && ' + stamplay_bin + ' init');
		terminal.stdin.write('\n');
		terminal.stdin.write(appId + ' no-pass');
		terminal.stdin.write('\n');
		terminal.stdin.end();
	})

	it('stamplay init (invalid credentials)', function (done) {
		var terminal = require('child_process').spawn('bash');	
		var input = 0;
		
		terminal.stdout.on('data', function (data) {
		  var output = data.toString();
		  
		  if (input == 0) 
		  	assert.equal(output, 'Enter your appId: ');
		  else if (input == 1) 
		  	assert.equal(output, 'Enter your apiKey: ');
		  else if (input == 2) { 
		  	assert.equal(output, 'Error : AppId or apiKey are incorrect\n');
		  	done();
		  }
		  input++;
		});
		
		terminal.stdin.write('cd ' + fixtures_folder + ' && ' + stamplay_bin + ' init');
		terminal.stdin.write('\n');
		
		setTimeout(function(){
			terminal.stdin.write(appId + 'no-pass');
			terminal.stdin.write('\n');
		},1000)
		
		setTimeout(function(){
			terminal.stdin.write(apiKey);
			terminal.stdin.write('\n');
			terminal.stdin.end();
		},2000)
	})

	it('stamplay init', function (done) {

		var terminal = require('child_process').spawn('bash');	
		var input = 0;
		terminal.stdout.on('data', function (data) {
		  var output = data.toString();
		  if (input == 0) 
			  assert.equal(output, 'Enter your appId: ');
			else if (input == 1)
		 		assert.equal(output,'Enter your apiKey: ');
			else if (input == 2)
		 		assert.equal(output, 'Initialized Stamplay project clitest\n');
			input++;
		});
		
		terminal.on('exit', function (code) {
			var stamplay_json = require('../fixtures/stamplay.json');
			assert.equal(stamplay_json.appId, appId);
			assert.equal(stamplay_json.apiKey, apiKey);
			assert.equal(stamplay_json.public, './');
			assert.equal(stamplay_json.ignore.length, 3);

			done();
		});
		
		terminal.stdin.write('cd ' + fixtures_folder + ' && ' + stamplay_bin + ' init');
		terminal.stdin.write('\n');
		
		setTimeout(function(){
			terminal.stdin.write(appId);
			terminal.stdin.write('\n');
		},1000)
		
		setTimeout(function(){
			terminal.stdin.write(apiKey);
			terminal.stdin.write('\n');
			terminal.stdin.end();
		},2000)
	})
})