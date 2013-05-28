var fs = require('fs');
var Path = require('path');

var orig_writeFile = fs.writeFile;
var orig_writeFileSync = fs.writeFileSync;

function json2yaml(data) {
	var YAML = require('js-yaml');
	return YAML.safeDump(JSON.parse(data.toString('utf8')));
}

fs.writeFile = function(path, data) {
	if (Path.basename(path) === 'package.json') {
		var orig_args = arguments;
		var args = Array.prototype.slice.apply(arguments);

		fs.exists(path, function(err, result) {
			if (err) return callback.apply(null, arguments);
			if (result) return orig_writeFileSync.apply(fs, orig_args);

			args[0] = Path.join(Path.dirname(path), 'package.yaml');
			args[1] = json2yaml(data);
			if (typeof(args[args.length-1]) === 'function') {
				var callback = args[args.length-1];
				args[args.length-1] = function(err, data) {
					callback.apply(null, arguments);
				}
			}		
			orig_writeFile.apply(fs, args);
		});
	} else {
		orig_writeFile.apply(fs, arguments);
	}
}

fs.writeFileSync = function(path, data) {
	if (Path.basename(path) === 'package.json') {
		var orig_args = arguments;
		var args = Array.prototype.slice.apply(arguments);

		if (fs.existsSync(path)) {
			args[0] = Path.join(Path.dirname(path), 'package.yaml');
			args[1] = json2yaml(data);
			return orig_writeFileSync.apply(fs, args);
		} else {
			return orig_writeFileSync.apply(fs, arguments);
		}
	} else {
		return orig_writeFileSync.apply(fs, arguments);
	}
}

