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

describe('Stamplay cli start command', function () {
		
	beforeEach(function(done){
		var data = {};
		data.appId = appId;
		data.apiKey = apiKey;
		data.public = './';
		data.ignore = ["stamplay.json", "**/.*", "**/node_modules/**"];
		var dataString = JSON.stringify(data, null, 2) + '\n';
		rmdir(fixtures_folder, function(){
			fs.mkdir(fixtures_folder, function(){
  			fs.writeFile(fixtures_folder + '/stamplay.json', dataString, function(){
  				fs.writeFile(fixtures_folder + '/index.html', '<h1>start command</h1>', function(){
  					done();
  				})
  			})
  		})
		})
	})

	it('stamplay  (no stamplay.json file)', function (done) {
		exec(stamplay_bin + ' start', function (error, stdout, stderr) {
			stdout = stdout.replace(lastEnterChar, '');

			assert.equal(error.code, 1);
			assert.equal(stderr, '');
			assert.equal(stdout, 'Error : missing stamplay.json file, are you sure that is the right directory?');

			done();	
		})
	})

	it('stamplay start', function (done) {
		this.timeout(5000);
		var terminal = require('child_process').spawn('bash');	
		
		terminal.stdout.on('data', function (data) {
		  var output = data.toString();
		  assert.equal(output, 'Server running with ./ as public folder at the following address http://localhost:8080\n');

		  setTimeout(function(){
		  	process.kill(terminal.pid+1,'SIGINT'); 
		  	terminal.kill();	
		  }, 1000);
		});
		
		terminal.on('exit', function (code) {
			done();
		});
			
		terminal.stdin.write('cd ' + fixtures_folder + ' && ' + stamplay_bin + ' start');
		terminal.stdin.write('\n');
		terminal.stdin.end();
	})
})