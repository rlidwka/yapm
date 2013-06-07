#!/usr/bin/env node

console.log('these tests are for the old code, use test-read instead');
return process.exit(0);

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
Y.test_nonascii = '\u0442\u0435\u0441\u0442';
require('../lib');

['package.yaml', 'package.json'].forEach(function(file) {
	if (exists(file)) {
		console.error('%s exists in current directory, refusing to start', file);
		process.exit(1);
	}
});

process.nextTick(function() {
	async.series(tests.map(function(fn, _i) {
		return function() {
			console.log('running test', _i);
			fn.apply(null, arguments);
		};
	}), function(err) {
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
tests.push(function(cb) {
	assert.throws(function() {
		console.log(fs.readFileSync('package.json'));
	});
	cb();
});

tests.push(function(cb) {
	fs.readFile('package.json', function(err) {
		assert(err);
		cb();
	});
});

// testing package.json without yaml
tests.push(function(cb) {
	write('package.json', JSON.stringify(Y));
	cb();
});

tests.push(function(cb) {
	assert.deepEqual(JSON.parse(fs.readFileSync('package.json', 'utf8')), Y);
	cb();
});

tests.push(function(cb) {
	fs.readFile('package.json', 'utf8', function(err, data) {
		assert(!err);
		assert.deepEqual(JSON.parse(data), Y);
		cb();
	});
});

// without encoding
tests.push(function(cb) {
	assert.deepEqual(JSON.parse(fs.readFileSync('package.json').toString('utf8')), Y);
	cb();
});

tests.push(function(cb) {
	fs.readFile('package.json', function(err, data) {
		assert(!err);
		assert.deepEqual(JSON.parse(data.toString('utf8')), Y);
		cb();
	});
});

// testing both - should read json!
tests.push(function(cb) {
	write('package.yaml', 'garbage: garbage');
	cb();
});

tests.push(function(cb) {
	assert.deepEqual(JSON.parse(fs.readFileSync('package.json', 'utf8')), Y);
	cb();
});

tests.push(function(cb) {
	fs.readFile('package.json', 'utf8', function(err, data) {
		assert(!err);
		assert.deepEqual(JSON.parse(data), Y);
		cb();
	});
});

// testing package.yaml without json
tests.push(function(cb) {
	unlink('package.json');
	write('package.yaml', yaml.safeDump(Y));
	cb();
});

tests.push(function(cb) {
	assert.deepEqual(JSON.parse(fs.readFileSync('package.json', 'utf8')), Y);
	cb();
});

tests.push(function(cb) {
	fs.readFile('package.json', 'utf8', function(err, data) {
		assert(!err);
		assert.deepEqual(JSON.parse(data), Y);
		cb();
	});
});

