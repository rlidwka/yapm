var fs = require('fs');
var Path = require('path');
var Stream = require('stream');

var orig_createReadStream = fs.createReadStream;
var orig_lstat = fs.lstat;
var orig_lstatSync = fs.lstatSync;

fs.lstat = function(path, callback) {
	if (Path.basename(path) === 'package.json') {
		var ypath = Path.join(Path.dirname(path), 'package.yaml');
		orig_lstat(path, function(err, results) {
			if (err) {
				return orig_lstat(ypath, function(err, results) {
					if (err) return callback(err);

					// compiling yaml only to get it's size... damn
					// maybe I should've forked npm instead -_-
					fs.readFile(path, 'utf8', function(err, res) {
						if (err) return callback(err);
						results.size = res.length;
						callback(err, results);
					});
				});
			}
			callback(err, results);
		});
	} else {
		orig_lstat.apply(fs, arguments);
	}
}

/*
// too lazy to support this... npm don't use sync version anyway
//
fs.lstatSync = function(path) {
	if (Path.basename(path) === 'package.json') {
		try {
			return orig_lstatSync(path);
		} catch(err) {
			var ypath = Path.join(Path.dirname(path), 'package.yaml');
			return orig_lstatSync(ypath);
		}
	} else {
		return orig_lstatSync.apply(fs, arguments);
	}
}*/

// for node-tar: packing, etc.
fs.createReadStream = function(path, options) {
	if (Path.basename(path) === 'package.json') {
		options = options || {};

		// we're using very simple implementation, so...
		if (options.start || options.stop)
			throw new Error('ynpm: options.start and options.stop aren\'t implemented');
		if (options.encoding)
			throw new Error('ynpm: options.encoding isn\'t implemented');

		var stream = new Stream.PassThrough();

		// note: fs.readFile is already overridden here
		fs.readFile(path, 'utf8', function(err, res) {
console.log(res.length);
			stream.emit('open');
			stream.emit('data', res);
			stream.emit('end');
			stream.emit('close');
		});
		return stream;
	}
	return orig_createReadStream.apply(fs, arguments);
}

