var child_process = require('child_process');
var fs = require('fs');

var orig_execFile = child_process.execFile;
var orig_exists = fs.exists;

child_process.execFile = function(file, args, options, callback) {
	var fargs = Array.prototype.slice.call(arguments);
	if (file === 'git'
	 && args.length === 2
	 && args[0] === 'add'
	 && args[1] === 'package.json') {
		orig_exists('package.yaml', function(exists) {
			if (exists) {
				// package.yaml exists, so assuming that user works with this format
				fargs[1][1] = 'package.yaml';
			}
			orig_execFile.apply(child_process, fargs);
		});
	} else {
		orig_execFile.apply(child_process, fargs);
	}
}

