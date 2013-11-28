var child_process = require('child_process')
  , fs = require('fs')

var orig_execFile = child_process.execFile
  , orig_exists = fs.exists

child_process.execFile = function(file, args, options, callback) {
	var fargs = Array.prototype.slice.call(arguments)
	if (file === 'git'
	 && args.length === 2
	 && args[0] === 'add'
	 && args[1] === 'package.json') {
		return check_override(['package.yaml', 'package.json5'])
	} else {
		return result()
	}

	function result() {
		orig_execFile.apply(child_process, fargs)
	}

	function check_override(list) {
		if (!list.length) return result()

		var alt_file = list.shift()
		orig_exists(alt_file, function(exists) {
			if (exists) {
				// alt_file exists, so assuming that user works with this format
				fargs[1][1] = alt_file
				return result()

			} else {
				// alt_file doesn't exist, looking for next one
				check_override(list)
			}
		})
	}
}

