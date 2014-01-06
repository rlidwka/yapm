#!/usr/bin/env node

var yaml = require('js-yaml');
var editor = require('..').edit;
var assert = require('assert');
var fs = require('fs');

fs.readdirSync(__dirname + '/resources').forEach(function(file) {
	if (process.argv.length > 2) {
		if (process.argv.slice(2).indexOf(file) === -1) return;
	} else {
		if (!file.match(/\.yaml$/)) return;
	}
	console.log('running', file);
	var data = fs.readFileSync(__dirname + '/resources/'+file, 'utf8').split('---\n');
	assert(data.length === 2);
});

