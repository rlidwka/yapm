var fs = require('fs');
var Path = require('path');

var orig_readFile = fs.readFile;
var orig_readFileSync = fs.readFileSync;

function yaml2json(data) {
	var YAML = require('js-yaml');
	return JSON.stringify(YAML.safeLoad(data.toString('utf8')));
}

// read_*_callback are used in both sync and async code...
// so they should be syncronous
function read_yaml_callback(orig_cb) {
	return function(err, data) {
		if (!err) {
			try {
				data = yaml2json(data);
			} catch(err) {
				return orig_cb(err);
			}
		}
		orig_cb(err, data);
	}
}

function read_json_callback(orig_cb, err_cb) {
	return function(err, data) {
		if (err && err.code === 'ENOENT') {
			err_cb();
		} else {
			orig_cb.apply(null, arguments);
		}
	}
}

fs.readFile = function(path) {
	if (Path.basename(path) === 'package.json') {
		var orig_args = arguments;
		var args = Array.prototype.slice.apply(orig_args);

		if (typeof(args[args.length-1]) === 'function') {
			var callback = args[args.length-1];
			args[args.length-1] = read_json_callback(callback, function() {
				args = Array.prototype.slice.apply(orig_args);
				args[0] = Path.join(Path.dirname(path), 'package.yaml');
				args[args.length-1] = read_yaml_callback(callback);
				orig_readFile.apply(fs, args);
			});
		}
		orig_readFile.apply(fs, args);
	} else {
		orig_readFile.apply(fs, arguments);
	}
}

fs.readFileSync = function(path) {
	if (Path.basename(path) === 'package.json') {
		var orig_args = arguments;
		var args = Array.prototype.slice.apply(orig_args);

		var result;
		function callback(err, data) {
			if (err) throw err;
			result = data;
		}

		try {
			var result = orig_readFileSync.apply(fs, args);
		} catch(err) {
			read_json_callback(callback, function() {
				args = Array.prototype.slice.apply(orig_args);
				args[0] = Path.join(Path.dirname(path), 'package.yaml');

				try {
					var result = orig_readFileSync.apply(fs, args);
				} catch(err) {
					read_yaml_callback(callback)(err);
				}
				read_yaml_callback(callback)(null, result);
			})(err);
		}

		return result;
	} else {
		return orig_readFileSync.apply(fs, arguments);
	}
}

