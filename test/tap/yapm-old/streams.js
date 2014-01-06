#!/usr/bin/env node

var yaml = require('js-yaml')
  , fs = require('fs')
  , assert = require('assert')
  , async = require('async')

var read = fs.readFileSync
  , write = fs.writeFileSync
  , unlink = fs.unlinkSync
  , exists = fs.existsSync
  , tests = []

var Y = yaml.safeLoad(require('fs').readFileSync('../package.yaml', 'utf8'))
Y.test_nonascii = '\u0442\u0435\u0441\u0442'
var J5 = {test:123,something:456}
var J5str = '{test:123,something:456}'
require('../lib')

;['package.yaml', 'package.json5', 'package.json'].forEach(function(file) {
	if (exists(file)) {
		console.error('%s exists in current directory, refusing to start', file)
		process.exit(1)
	}
})

function addtest(desc, fn) {
	var i = tests.length
	tests.push(function() {
		console.log('running test %s/%s: %s', i+1, tests.length, desc)
		fn.apply(null, arguments)
	})
}

function check_stream(should_be, cb) {
	var stream = fs.createReadStream('package.json')
	//stream.setEncoding('utf8')
	var data = ''
	stream.on('data', function(d) {
		data += d
	})
	stream.on('end', function() {
		assert.equal(data, should_be)
		cb()
	})
	stream.on('error', function(err) {
		throw err
	})
}

process.nextTick(function() {
	async.series(tests, function(err) {
		if (err) throw err
		try {
			unlink('package.json')
		} catch(e) {}
		try {
			unlink('package.yaml')
		} catch(e) {}
		console.log('completed')
	})
})

// no config file exists just yet
addtest('nothing#lstat', function(cb) {
	fs.lstat('package.json', function(err) {
		assert(err)
		cb()
	})
})

addtest('nothing#stream', function(cb) {
	var stream = fs.createReadStream('package.json')
	stream.on('data', function() {
		throw 'data?'
	})
	stream.on('end', function() {
		throw 'end?'
	})
	stream.on('error', function(err) {
		assert.equal(err.code, 'ENOENT')
		cb()
	})
})

// testing package.json without yaml
addtest('json#prepare', function(cb) {
	write('package.json', JSON.stringify(Y))
	cb()
})

addtest('json#lstat', function(cb) {
	fs.lstat('package.json', function(err, data) {
		assert(!err)
		assert.equal(data.size, (new Buffer(JSON.stringify(Y))).length)
		cb()
	})
})

addtest('json#stream', function(cb) {
	check_stream(JSON.stringify(Y), cb)
})

// testing both - should read yaml!
addtest('both#prepare', function(cb) {
	write('package.yaml', JSON.stringify(Y))
	write('package.json', '{"garbage":"garbage"}')
	cb()
})

addtest('both#lstat', function(cb) {
	fs.lstat('package.json', function(err, data) {
		assert(!err)
		assert.equal(data.size, JSON.stringify(Y).length)
		cb()
	})
})

addtest('both#stream', function(cb) {
	check_stream(JSON.stringify(Y), cb)
})

// testing package.yaml without json
addtest('yaml#prepare', function(cb) {
	unlink('package.json')
	cb()
})

addtest('yaml#lstat', function(cb) {
	fs.lstat('package.json', function(err, data) {
		assert(!err)
		assert.equal(data.size, JSON.stringify(Y).length)
		cb()
	})
})

addtest('yaml#stream', function(cb) {
	check_stream(JSON.stringify(Y), cb)
})

// testing package.json5 without json
addtest('json5#prepare', function(cb) {
	unlink('package.yaml')
	write('package.json5', J5str)
	cb()
})

addtest('json5#lstat', function(cb) {
	fs.lstat('package.json', function(err, data) {
		assert(!err)
		assert.equal(data.size, JSON.stringify(J5).length)
		cb()
	})
})

addtest('json5#stream', function(cb) {
	check_stream(JSON.stringify(J5), cb)
})

addtest('cleanup', function(cb) {
	unlink('package.json5')
})

