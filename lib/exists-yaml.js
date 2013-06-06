
/*
 *   this is currently UNUSED AND UNTESTED
 */

var fs = require('fs');
var Path = require('path');

var orig_exists = fs.exists;
var orig_existsSync = fs.existsSync;

fs.exists = function(path, callback) {
	if (Path.basename(path) === 'package.json') {
		var ypath = Path.join(Path.dirname(path), 'package.yaml');
		orig_exists(ypath, function(result) {
			if (result) return callback(result);
			return orig_exists(path, callback);
		});
	} else {
		orig_exists.apply(fs, arguments);
	}
}

fs.existsSync = function(path) {
	if (Path.basename(path) === 'package.json') {
		var ypath = Path.join(Path.dirname(path), 'package.yaml');
		return orig_existsSync(ypath) || orig_existsSync(path);
	} else {
		return orig_existsSync.apply(fs, arguments);
	}
}

