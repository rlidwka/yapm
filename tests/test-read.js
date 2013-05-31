#!/usr/bin/env node

var yaml = require('js-yaml');
var fs = require('fs');
var assert = require('assert');
var async = require('async');

var read = fs.readFileSync;
var write = fs.writeFileSync;
var unlink = fs.unlinkSync;
var exists = fs.existsSync;
var tests = [];

var Y = yaml.safeLoad(require('fs').readFileSync('../package.yaml', 'utf8'));
require('../lib/read-yaml');
require('../lib/write-yaml');

['package.yaml', 'package.json'].forEach(function(file) {
	if (exists(file)) {
		console.error('%s exists in current directory, refusing to start', file);
		process.exit(1);
	}
});

function addtest(desc, fn) {
	var i = tests.length;
	tests.push(function() {
		console.log('running test %s/%s: %s', i+1, tests.length, desc);
		fn.apply(null, arguments);
	});
}

process.nextTick(function() {
	async.series(tests, function(err) {
		if (err) throw err;
		try {
			unlink('package.json');
		} catch(e) {}
		try {
			unlink('package.yaml');
		} catch(e) {}
		console.log('completed');
	});
});

// no config file exists just yet
addtest('nothing#sync', function(cb) {
	assert.throws(function() {
		console.log(fs.readFileSync('package.json'));
	});
	cb();
});

addtest('nothing#async', function(cb) {
	fs.readFile('package.json', function(err) {
		assert(err);
		cb();
	});
});

// testing package.json without yaml
addtest('json#prepare', function(cb) {
	write('package.json', JSON.stringify(Y));
	cb();
});

addtest('json#sync', function(cb) {
	assert.deepEqual(JSON.parse(fs.readFileSync('package.json', 'utf8')), Y);
	cb();
});

addtest('json#async', function(cb) {
	fs.readFile('package.json', 'utf8', function(err, data) {
		assert(!err);
		assert.deepEqual(JSON.parse(data), Y);
		cb();
	});
});

// without encoding
addtest('json#sync2', function(cb) {
	assert.deepEqual(JSON.parse(fs.readFileSync('package.json').toString('utf8')), Y);
	cb();
});

addtest('json#async2', function(cb) {
	fs.readFile('package.json', function(err, data) {
		assert(!err);
		assert.deepEqual(JSON.parse(data.toString('utf8')), Y);
		cb();
	});
});

// testing both - should read yaml!
addtest('both#prepare', function(cb) {
	write('package.json', '{"garbage":"garbage"}');
	write('package.yaml', yaml.safeDump(Y));
	cb();
});

addtest('both#sync', function(cb) {
	assert.deepEqual(JSON.parse(fs.readFileSync('package.json', 'utf8')), Y);
	cb();
});

addtest('both#async', function(cb) {
	fs.readFile('package.json', 'utf8', function(err, data) {
		assert(!err);
		assert.deepEqual(JSON.parse(data), Y);
		cb();
	});
});

// testing package.yaml without json
addtest('yaml#prepare', function(cb) {
	unlink('package.json');
	cb();
});

addtest('yaml#sync', function(cb) {
	assert.deepEqual(JSON.parse(fs.readFileSync('package.json', 'utf8')), Y);
	cb();
});

addtest('yaml#async', function(cb) {
	fs.readFile('package.json', 'utf8', function(err, data) {
		assert(!err);
		assert.deepEqual(JSON.parse(data), Y);
		cb();
	});
});

