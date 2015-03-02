var assert = require("assert"),
	pkg = require('../../package.json'),
	sinon = require('sinon'),
	help = require('../../lib/help'),
	sinon = require('sinon'),
	rmdir = require('rimraf'),
	fs = require('fs'),
	exec = require('child_process').exec;

var apiKey = 'c4300c0c4c0df03e9fbaae97e53f297347fcd5d7b44811c2025dd52fd2f45843';
var appId = 'clitest';

var lastEnterChar = new RegExp('\n$');

describe('Test shell commands', function () {

	describe('Stamplay cli version command', function () {

		it('stamplay -v', function (done) {
			exec('../../bin/stamplay -v', function (error, stdout, stderr) {
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
			exec('../../bin/stamplay -v', function (error, stdout, stderr) {
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

	describe('Stamplay cli help command', function () {
		
		it('stamplay', function (done) {
			exec('../../bin/stamplay', function (error, stdout, stderr) {
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
			exec('../../bin/stamplay -h', function (error, stdout, stderr) {
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

		it('stamplay --help', function (done) {
			exec('../../bin/stamplay --help', function (error, stdout, stderr) {
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
			});
		});

		it('stamplay help', function (done) {
			exec('../../bin/stamplay help', function (error, stdout, stderr) {
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
	
	describe('Stamplay cli init command', function () {
		this.timeout(10000);
		
		beforeEach(function(done){
			rmdir('../fixtures', function(){
				fs.mkdir('../fixtures', function(){
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
			
			
			terminal.stdin.write('cd ../fixtures && ../../bin/stamplay init');
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
			
			terminal.stdin.write('cd ../fixtures && ../../bin/stamplay init');
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
			
			terminal.stdin.write('cd ../fixtures && ../../bin/stamplay init');
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

	describe('Stamplay cli open command', function () {
		
		beforeEach(function(done){
			var data = {};
  		data.appId = appId;
  		data.apiKey = apiKey;
  		data.public = './';
  		data.ignore = ["stamplay.json", "**/.*", "**/node_modules/**"];
  		var dataString = JSON.stringify(data, null, 2) + '\n';
  		rmdir('../fixtures', function(){
				fs.mkdir('../fixtures', function(){
	  			fs.writeFile('../fixtures/stamplay.json', dataString, function(){
	  				done();
	  			})
	  		})
  		})
		})

		it('stamplay open (no stamplay.json file)', function (done) {
			exec('../../bin/stamplay open', function (error, stdout, stderr) {
				stdout = stdout.replace(lastEnterChar, '');

				assert.equal(error.code, 1);
				assert.equal(stderr, '');
				assert.equal(stdout, 'Error : missing stamplay.json file, are you sure that is the right directory?');

				done();	
			})
		})

		it('stamplay open', function (done) {
			exec('cd ../fixtures/ && ../../bin/stamplay open', function (error, stdout, stderr) {
				assert.equal(error, null);
				assert.equal(stderr, '');

				done();	
			})
		})
	})

	describe('Stamplay cli deploy command', function () {
		
		this.timeout(10000);
		
		beforeEach(function(done){
			var data = {};
  		data.appId = appId;
  		data.apiKey = apiKey;
  		data.public = './';
  		data.ignore = ["stamplay.json", "**/.*", "**/node_modules/**"];
  		var dataString = JSON.stringify(data, null, 2) + '\n';
  		rmdir('../fixtures', function(){
				fs.mkdir('../fixtures', function(){
	  			fs.writeFile('../fixtures/stamplay.json', dataString, function(){
	  				fs.writeFile('../fixtures/index.html', '<h1>test</h1>', function(){
	  					done();
	  				})
	  			})
	  		})
  		})
		})

		it('stamplay deploy', function (done) {
			var terminal = require('child_process').spawn('bash');	
			
			terminal.on('exit', function (code) {
				done();
			});
			
			terminal.stdin.write('cd ../fixtures && ../../bin/stamplay deploy');
			terminal.stdin.write('\n');
			
			setTimeout(function(){
				terminal.stdin.write('test comment');
				terminal.stdin.write('\n');
				terminal.stdin.end();
			},1000)
		})

		it('stamplay deploy (no index.html)', function (done) {
			fs.unlink('../fixtures/index.html', function(){
				var terminal = require('child_process').spawn('bash');	
				var res = '';

				terminal.stdout.on('data', function (data) {
					res += data
				});
				
				terminal.on('exit', function () {
					assert.equal(res.toString(), 'Missing index.html in your public folder undefined please edit stamplay.json\n')
					done();
				});
				

				terminal.stdin.write('cd ../fixtures && ../../bin/stamplay deploy');
				terminal.stdin.write('\n');
				
				setTimeout(function(){
					terminal.stdin.write('test comment');
					terminal.stdin.write('\n');
					terminal.stdin.end();
				},1000)
			})
		})
	})

	describe('Stamplay cli download command', function () {
		
		this.timeout(10000);
		
		beforeEach(function(done){
			var data = {};
  		data.appId = appId;
  		data.apiKey = apiKey;
  		data.public = './';
  		data.ignore = ["stamplay.json", "**/.*", "**/node_modules/**"];
  		var dataString = JSON.stringify(data, null, 2) + '\n';
  		rmdir('../fixtures', function(){
				fs.mkdir('../fixtures', function(){
	  			done();
	  		})
  		})
		})

		it('stamplay download', function (done) {
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
				done();
			});
			
			terminal.stdin.write('cd ../fixtures && ../../bin/stamplay download');
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
})