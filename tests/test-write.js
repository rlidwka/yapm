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
Y.test_nonascii = '\u0442\u0435\u0441\u0442';
require('../lib');

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

// creating package.json, should write there
addtest('json#sync', function(cb) {
	write('package.json', '{"garbage":"garbage"}', 'utf8');
	fs.writeFileSync('package.json', JSON.stringify(Y));
	assert(!exists('package.yaml'));
	assert.deepEqual(JSON.parse(read('package.json').toString('utf8')), Y);
	unlink('package.json');
	cb();
});

addtest('json#async', function(cb) {
	write('package.json', '{"garbage":"garbage"}', 'utf8');
	fs.writeFile('package.json', JSON.stringify(Y), function(err, res) {
		assert(!err);
		assert(!exists('package.yaml'));
		assert.deepEqual(JSON.parse(read('package.json').toString('utf8')), Y);
		unlink('package.json');
		cb();
	});
});

// creating package.yaml, should write there
addtest('yaml#sync', function(cb) {
	write('package.yaml', 'garbage: garbage', 'utf8');
	fs.writeFileSync('package.json', JSON.stringify(Y));
	assert(!exists('package.json'));
	assert.deepEqual(yaml.safeLoad(read('package.yaml').toString('utf8')), Y);
	unlink('package.yaml');
	cb();
});

addtest('yaml#async', function(cb) {
	write('package.yaml', 'garbage: garbage', 'utf8');
	fs.writeFile('package.json', JSON.stringify(Y), function(err, res) {
		assert(!err);
		assert(!exists('package.json'));
		assert.deepEqual(yaml.safeLoad(read('package.yaml').toString('utf8')), Y);
		unlink('package.yaml');
		cb();
	});
});

// both exist, choose json (?)
addtest('both#sync', function(cb) {
	write('package.json', '{"garbage":1}', 'utf8');
	write('package.yaml', 'garbage: 1', 'utf8');
	fs.writeFileSync('package.json', JSON.stringify(Y));
	assert.deepEqual(yaml.safeLoad(read('package.yaml').toString('utf8')), {garbage:1});
	assert.deepEqual(JSON.parse(read('package.json').toString('utf8')), Y);
	cb();
});

addtest('both#async', function(cb) {
	write('package.json', '{"garbage":"garbage"}', 'utf8');
	write('package.yaml', 'garbage: 1', 'utf8');
	fs.writeFile('package.json', JSON.stringify(Y), function(err, res) {
		assert(!err);
		assert.deepEqual(yaml.safeLoad(read('package.yaml').toString('utf8')), {garbage:1});
		assert.deepEqual(JSON.parse(read('package.json').toString('utf8')), Y);
		cb();
	});
});
