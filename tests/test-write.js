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
	fs.writeFileSync('package.json', JSON.stringify(Y));
	assert(!exists('package.json'));
	assert.deepEqual(yaml.safeLoad(read('package.yaml').toString('utf8')), Y);
	unlink('package.yaml');
	cb();
});

addtest('nothing#async', function(cb) {
	fs.writeFile('package.json', JSON.stringify(Y), function(err, res) {
		assert(!err);
		assert(!exists('package.json'));
		assert.deepEqual(yaml.safeLoad(read('package.yaml').toString('utf8')), Y);
		unlink('package.yaml');
		cb();
	});
});

// with encoding
addtest('nothing#sync2', function(cb) {
	fs.writeFileSync('package.json', JSON.stringify(Y), 'utf8');
	assert(!exists('package.json'));
	assert.deepEqual(yaml.safeLoad(read('package.yaml').toString('utf8')), Y);
	unlink('package.yaml');
	cb();
});

addtest('nothing#async2', function(cb) {
	fs.writeFile('package.json', JSON.stringify(Y), 'utf8', function(err, res) {
		assert(!err);
		assert(!exists('package.json'));
		assert.deepEqual(yaml.safeLoad(read('package.yaml').toString('utf8')), Y);
		unlink('package.yaml');
		cb();
	});
});

