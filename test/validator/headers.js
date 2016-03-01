var validator = require('../../lib/validator/headers'),
		assert = require('assert')

describe('Custom headers validator', function(){

	it('Should returns false because there aren\'t headers', function(){
		var headers = []
		var validation = validator(headers)
		assert.equal(validation, false)
		
	})

	it('Should returns an error because headers isn\'t an array', function(){
		var headers = {}
		try {
			validator(headers)
		} catch (e) {
			assert.equal(e.message, 'Headers must be an Array')
		}
	})

	it('Should returns an error because the element isn\'t an object ', function(){
		var headers = [1, 2]
		try {
			validator(headers)
		} catch (e) {
			assert.equal(e.message, 'Each element in array headers must be an Object')
		}
	})

	it('Should returns an error because the source key is missing in the object', function(){
		var headers = [{}, {}]
		try {
			validator(headers)
		} catch (e) {
			assert.equal(e.message, 'Missing source')
		}
	})

	it('Should returns an error because in the source there isn\'t the headers array', function(){
		var headers = [{
			source: '*.js'
		}]
		try {
			validator(headers)
		} catch (e) {
			assert.equal(e.message, 'The source *.js hasn\'t the headers array')
		}
	})

	it('Should returns an error because headers array isn\'t an array', function(){
		var headers = [{
			source: '*.js',
			headers: {}
		}]
		try {
			validator(headers)
		} catch (e) {
			assert.equal(e.message, 'The source *.js hasn\'t the headers array')
		}
	})

	it('Should returns an error because the object is empty', function(){
		var headers = [{
			source: '*.js',
			headers: [{}]
		}]
		try {
			validator(headers)
		} catch (e) {
			assert.equal(e.message, 'Each object in headers array must have key and value properties')
		}
	})

	it('Should returns an error because the header test in not allowed', function(){
		var headers = [{
			source: '*.js',
			headers: [{
				key: 'test',
				value: 'ok'
			}]
		}]
		try {
			validator(headers)
		} catch (e) {
			assert.equal(e.message, 'Header test not allowed. You can only use this headers: cache-control,expires')
		}
	})

	it('Should be ok because the headers are specified correctly', function(){
		var headers = [{
			source: '*.js',
			headers: [{
				key: 'cache-control',
				value: 'max-age=10'
			}]
		}]
		var validation = validator(headers)
		assert.equal(validation.length, 1)
		assert.equal(JSON.stringify(headers), JSON.stringify(validation))
	})

	it('Should be ok because the headers are specified correctly', function(){
		var headers = [{
			source: '*.js',
			headers: [{
				key: 'cache-control',
				value: 'max-age=10'
			}]
		},{
			source: '*.css',
			headers: [{
				key: 'expires',
				value: '10'
			}]
		}]

		var validation = validator(headers)
		assert.equal(validation.length, 2)
		assert.equal(JSON.stringify(headers), JSON.stringify(validation))
	})
})