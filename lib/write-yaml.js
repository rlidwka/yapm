var fs = require('fs');
var Path = require('path');

var orig_writeFile = fs.writeFile;
var orig_writeFileSync = fs.writeFileSync;
var orig_exists = fs.exists;
var orig_existsSync = fs.existsSync;

// stringified json -> stringified yaml
function json2yaml(data) {
	var YAML = require('js-yaml');
	return YAML.safeDump(JSON.parse(data.toString('utf8')));
}

fs.writeFile = function(path, data) {
	if (Path.basename(path) === 'package.json') {
		var orig_args = arguments;
		var args = Array.prototype.slice.apply(arguments);
		var ypath = Path.join(Path.dirname(path), 'package.yaml');

		function write_yaml() {
			args[0] = ypath;
			fs.readFile(args[0], 'utf8', function(err, result) {
				if (err) {
					// probably ENOENT or smth
					args[1] = json2yaml(data);
				} else {
					try {
						args[1] = require('yaml-update').edit(result, data);
					} catch(err) {
						console.log('| ynpm warning: can\'t update package.yaml without rewriting the file: ', err);
						console.log('| if you think it\'s an error, report it here: https://github.com/rlidwka/ynpm/issues');
						args[1] = json2yaml(data);
					}
				}
				orig_writeFile.apply(fs, args);
			});
		}

		function write_json() {
			orig_writeFile.apply(fs, orig_args);
		}

		orig_exists(ypath, function(result) {
			if (result) {
				// +yaml, +json
				// +yaml, -json
				return write_yaml();
			} else {
				orig_exists(path, function(result) {
					if (result) {
						// -yaml, +json
						return write_json();
					} else {
						// -yaml, -json
						return write_yaml();
					}
				});
			}
		});
	} else {
		orig_writeFile.apply(fs, arguments);
	}
}

fs.writeFileSync = function(path, data) {
	if (Path.basename(path) === 'package.json') {
		var ypath = Path.join(Path.dirname(path), 'package.yaml');
		var args = Array.prototype.slice.apply(arguments);

		function write_yaml() {
			args[0] = ypath;
			try {
				var result = fs.readFileSync(args[0], 'utf8');
			} catch(err) {}
			if (result) {
				try {
					args[1] = require('yaml-update').edit(result, data);
				} catch(err) {
					console.log('| ynpm warning: can\'t update package.yaml without rewriting the file: ', err);
					console.log('| if you think it\'s an error, report it here: https://github.com/rlidwka/ynpm/issues');
					args[1] = json2yaml(data);
				}
			} else {
				args[1] = json2yaml(data);
			}
			return orig_writeFileSync.apply(fs, args);
		}
		
		function write_json() {
			return orig_writeFileSync.apply(fs, args);
		}

		if (orig_existsSync(ypath)) {
			return write_yaml();
		} else {
			if (orig_existsSync(path)) {
				return write_json();
			} else {
				return write_yaml();
			}
		}
	} else {
		return orig_writeFileSync.apply(fs, arguments);
	}
}

/*
 *  We DO NOT change createWriteStream function so installed packages
 *  would preserve original json file (npm uses createWriteStream when
 *  unpacking and writeFile when changing json)
 *
 *  I understand that it's an ugly hack that just happened to be possible
 */

/*
var orig = fs.createWriteStream;
fs.createWriteStream = function() {
	console.log(arguments);
	throw new Error();
	return orig.apply(fs, arguments);
}*/

