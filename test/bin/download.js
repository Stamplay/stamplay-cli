var assert = require("assert"),
	sinon = require('sinon'),
	help = require('../../lib/help'),
	path = require('path'),
	rmdir = require('rimraf'),
	fs = require('fs'),
	exec = require('child_process').exec

var apiKey = 'c4300c0c4c0df03e9fbaae97e53f297347fcd5d7b44811c2025dd52fd2f45843'
var appId = 'clitest'
var lastEnterChar = new RegExp('\n$')
var stamplay_bin = path.join(__dirname, '../../', '/bin/stamplay')
var fixtures_folder = path.join(__dirname, '../', '/fixtures')

describe('Stamplay cli download command', function () {
	
	this.timeout(10000)
	
	beforeEach(function(done){
		var data = {}
		data.appId = appId
		data.apiKey = apiKey
		data.public = './'
		data.ignore = ["stamplay.json", "**/.*", "**/node_modules/**"]
		var dataString = JSON.stringify(data, null, 2) + '\n'
		rmdir(fixtures_folder, function(){
			fs.mkdir(fixtures_folder, function(){
  			done()
  		})
		})
	})

	it('stamplay download', function (done) {
		var terminal = require('child_process').spawn('bash')	
		var input = 0
		
		terminal.stdout.on('data', function (data) {
		  var output = data.toString()
		  if (input == 0) 
			  assert.equal(output, 'Enter your appId: ')
			else if (input == 1)
		 		assert.equal(output,'Enter your apiKey: ')
			else if (input == 2)
		 		assert.equal(output, 'Initialized Stamplay project clitest\n')
			input++
		})
		
		terminal.on('exit', function (code) {
			done()
		})
		
		terminal.stdin.write('cd ' + fixtures_folder + ' && ' + stamplay_bin + ' download')
		terminal.stdin.write('\n')
		
		setTimeout(function(){
			terminal.stdin.write(appId)
			terminal.stdin.write('\n')
		},1000)
		
		setTimeout(function(){
			terminal.stdin.write(apiKey)
			terminal.stdin.write('\n')
			terminal.stdin.end()
		},2000)
	})
})