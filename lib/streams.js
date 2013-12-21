var fs = require('fs')
  , Path = require('path')
  , Stream = require('stream')
  , through = require('through')

var orig_createReadStream = fs.createReadStream
  , orig_lstat = fs.lstat
  , orig_lstatSync = fs.lstatSync

fs.lstat = function(path, callback) {
	if (Path.basename(path) === 'package.json') {
		check_override(module.exports.formats.slice(0))

		function check_override(list) {
			var alt_file = Path.join(Path.dirname(path), list.shift())
			orig_lstat(alt_file, function(err, results) {
				// if there's an error, try next one
				if (err) return list.length ? check_override(list) : callback(err)

				// compiling yaml only to get it's size... damn
				// maybe I should've forked npm instead -_-
				if (alt_file !== 'package.json') {
					fs.readFile(path, 'utf8', function(err, res) {
						if (err) return callback(err)
						results.size = res.length
						callback(err, results)
					})
				} else {
					callback(err, results)
				}
			})
		}

	} else {
		return orig_lstat(path, callback)
	}
}

/*
// too lazy to support this... npm don't use sync version anyway
//
fs.lstatSync = function(path) {
	if (Path.basename(path) === 'package.json') {
		try {
			return orig_lstatSync(path)
		} catch(err) {
			var ypath = Path.join(Path.dirname(path), 'package.yaml')
			return orig_lstatSync(ypath)
		}
	} else {
		return orig_lstatSync.apply(fs, arguments)
	}
}*/

// for node-tar: packing, etc.
fs.createReadStream = function(path, options) {
	if (Path.basename(path) === 'package.json') {
		options = options || {}

		// we're using very simple implementation, so...
		if (options.start || options.stop)
			throw new Error('yapm: options.start and options.stop aren\'t implemented')
		if (options.encoding)
			throw new Error('yapm: options.encoding isn\'t implemented')

		var stream = through()

		// note: fs.readFile is already overridden here
		fs.readFile(path, function(err, res) {
			if (err) return stream.emit('error', err)
			stream.emit('open')
			stream.write(res)
			stream.end()
		})
		return stream
	}
	return orig_createReadStream.apply(fs, arguments)
}

