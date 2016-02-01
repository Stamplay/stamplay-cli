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

describe('Stamplay cli open command', function () {
		
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
  				done()
  			})
  		})
		})
	})

	it('stamplay open (no stamplay.json file)', function (done) {
		exec(stamplay_bin + ' open', function (error, stdout, stderr) {
			stdout = stdout.replace(lastEnterChar, '')

			assert.equal(error.code, 1)
			assert.equal(stderr, '')
			assert.equal(stdout, 'Error : missing stamplay.json file, are you sure that is the right directory?')

			done()	
		})
	})

	it('stamplay open', function (done) {
		exec('cd ' + fixtures_folder + ' && ' + stamplay_bin + ' open', function (error, stdout, stderr) {
			assert.equal(error, null)
			assert.equal(stderr, '')

			done()	
		})
	})
})