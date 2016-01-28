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

describe('Stamplay cli deploy command', function () {
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
  			fs.writeFile(fixtures_folder + '/stamplay.json', dataString, function(){
  				fs.writeFile(fixtures_folder + '/index.html', '<h1>test</h1>', function(){
  					done()
  				})
  			})
  		})
		})
	})

	it('stamplay deploy', function (done) {
		var terminal = require('child_process').spawn('bash')	
		
		terminal.on('exit', function (code) {
			done()
		})
		
		terminal.stdin.write('cd ' + fixtures_folder + ' && ' + stamplay_bin + ' deploy')
		terminal.stdin.write('\n')
		
		setTimeout(function(){
			terminal.stdin.write('\n')
			terminal.stdin.end()
		},1000)
	})

	it('stamplay deploy (no index.html)', function (done) {
		fs.unlink(fixtures_folder + '/index.html', function(){
			var terminal = require('child_process').spawn('bash')	
			var res = ''

			terminal.stdout.on('data', function (data) {
				res += data
			})
			
			terminal.on('exit', function () {
				assert.equal(res.toString(), 'Missing index.html in your public folder undefined please edit stamplay.json\n')
				done()
			})
			

			terminal.stdin.write('cd ' + fixtures_folder + ' && ' + stamplay_bin + ' deploy')
			terminal.stdin.write('\n')
			
			setTimeout(function(){
				terminal.stdin.write('test comment')
				terminal.stdin.write('\n')
				terminal.stdin.end()
			},1000)
		})
	})
})