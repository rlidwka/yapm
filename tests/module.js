#!/usr/bin/env node

// testing if we're able to fool node.js itself

var yaml = require('js-yaml');
var fs = require('fs');
var assert = require('assert');
var async = require('async');

var read = fs.readFileSync;
var write = fs.writeFileSync;
var unlink = fs.unlinkSync;
var exists = fs.existsSync;

var Y = yaml.safeLoad(require('fs').readFileSync('../package.yaml', 'utf8'));
Y.main = 'blablabla.js';
require('../lib/read-yaml');
require('../lib/write-yaml');

['package.json', 'blablabla.js', 'index.js'].forEach(function(file) {
	if (exists(file)) {
		console.error('%s exists in current directory, refusing to start', file);
		process.exit(1);
	}
});

write('blablabla.js', 'module.exports = "PASSED";');
assert.equal(require('./blablabla'), "PASSED");
assert.throws(function() { require('./'); });
write('package.json', JSON.stringify(Y));
assert.equal(require('./'), "PASSED");
unlink('blablabla.js');
unlink('package.json');
console.log('ok');

