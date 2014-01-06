var assert = require('assert');
var FS = require('fs');
var Path = require('path');
var parse = require('../..').parse

var dirsPath = Path.resolve(__dirname, 'parse-cases');
var dirs = FS.readdirSync(dirsPath);

function addTest(arg) {
//	console.log('testing: ', arg)
	try {
		var x = parse(arg)
	} catch(err) {
//console.log(err)
		x = 'fail'
	}
	try {
		var z = eval('(function(){"use strict"\nreturn ('+String(arg)+'\n)\n})()')
	} catch(err) {
		z = 'fail'
	}
if (Number.isNaN(x)) x = '_NaN'
if (Number.isNaN(z)) z = '_NaN'
	assert.deepEqual(x, z)
}

function createTest(fileName, dir) {
    var ext = Path.extname(fileName);
    var filePath = Path.join(dirsPath, dir, fileName);
    var str = FS.readFileSync(filePath, 'utf8');
    addTest(str);
}

dirs.forEach(function (dir) {
    // create a test suite for this group of tests:
    exports[dir] = {};

    // otherwise create a test for each file in this group:
    FS.readdirSync(Path.join(dirsPath, dir)).forEach(function (file) {
        createTest(file, dir);
    });
});
