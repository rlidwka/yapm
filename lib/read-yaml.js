var fs = require('fs')
  , Path = require('path')

var orig_readFile = fs.readFile
  , orig_readFileSync = fs.readFileSync

var filters = {
	'package.json5': function json2json(data) {
		var JSON5 = require('json5-utils')
		return JSON.stringify(JSON5.parse(data.toString('utf8')))
	},

	'package.yaml': function yaml2json(data) {
		var YAML = require('js-yaml')
		return JSON.stringify(YAML.safeLoad(data.toString('utf8')))
	},

	'package.json': function(x) {
		return x
	},
}

// read_*_callback are used in both sync and async code...
// so they should be syncronous
function read_alt_callback(filter, orig_cb, err_cb) {
	return function(err, data) {
		if (err && err.code === 'ENOENT') {
			return err_cb(err)
		} else if (err) {
			return orig_cb(err)
		} else {
			try {
				data = filter(data)
			} catch(err) {
				err = orig_cb(err)
			}
		}
		orig_cb(err, data)
	}
}

fs.readFile = function(path) {
	if (Path.basename(path) === 'package.json'
	&&  typeof(arguments[arguments.length-1]) === 'function') {
		var orig_args = arguments
		var args = Array.prototype.slice.apply(orig_args)
		var callback = args[args.length-1]

		check_override(module.exports.formats.slice(0))
	} else {
		orig_readFile.apply(fs, arguments)
	}

	function check_override(list) {
		var alt_file = list.shift()
		args[0] = Path.join(Path.dirname(path), alt_file)
		args[args.length-1] = read_alt_callback(
			filters[alt_file],
			callback, // normal cb
			list.length ? check_override.bind(null, list) : callback
		)
		orig_readFile.apply(fs, args)
	}
}

fs.readFileSync = function(path) {
	if (Path.basename(path) === 'package.json') {
		var orig_args = arguments
		var args = Array.prototype.slice.apply(orig_args)

		var result
		function callback(err, data) {
			if (err) throw err
			result = data
		}

		check_override(module.exports.formats.slice(0))

		function check_override(list) {
			var err
			var alt_file = list.shift()
			args[0] = Path.join(Path.dirname(path), alt_file)
			try {
				var _result = orig_readFileSync.apply(fs, args)
			} catch(_err) {
				err = _err
			}

			read_alt_callback(
				filters[alt_file],
				callback, // normal cb
				list.length ? check_override.bind(null, list) : callback
			)(err, _result)
		}

		return result
	} else {
		return orig_readFileSync.apply(fs, arguments)
	}
}

