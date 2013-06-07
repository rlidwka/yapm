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

		orig_exists(path, function(result) {
			// file exists, so write to package.json
			if (result) return orig_writeFile.apply(fs, orig_args);

			// file doesn't exist, so write to package.yaml
			args[0] = Path.join(Path.dirname(path), 'package.yaml');
			args[1] = json2yaml(data);
			orig_writeFile.apply(fs, args);
		});
	} else {
		orig_writeFile.apply(fs, arguments);
	}
}

fs.writeFileSync = function(path, data) {
	if (Path.basename(path) === 'package.json') {
		if (!orig_existsSync(path)) {
			// file doesn't exist, so write to package.yaml
			var args = Array.prototype.slice.apply(arguments);
			args[0] = Path.join(Path.dirname(path), 'package.yaml');
			args[1] = json2yaml(data);
			return orig_writeFileSync.apply(fs, args);
		} else {
			// file exists, so write to package.json
			return orig_writeFileSync.apply(fs, arguments);
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

