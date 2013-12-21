var fs = require('fs')
  , Path = require('path')

var orig_writeFile = fs.writeFile
  , orig_writeFileSync = fs.writeFileSync
  , orig_exists = fs.exists
  , orig_existsSync = fs.existsSync
  , orig_readFile = fs.readFile
  , orig_readFileSync = fs.readFileSync

// stringified json -> stringified yaml
function json2yaml(data) {
	var YAML = require('js-yaml')
	return YAML.safeDump(JSON.parse(data.toString('utf8')))
}

// stringified json -> stringified yaml
function json2json(data) {
	var JSON5 = require('json5-utils')
	return JSON5.stringify(JSON.parse(data.toString('utf8')))
}

function update(file, old_data, new_data) {
	if (file === 'package.yaml') {
		if (!old_data) {
			return json2yaml(new_data)
		} else {
			try {
				return require('yaml-update').edit(new_data, old_data)
			} catch(err) {
				console.log('| yapm warning: can\'t update package.yaml without rewriting the file: ', err)
				console.log('| if you think it\'s an error, report it here: https://github.com/rlidwka/yapm/issues')
				return json2yaml(new_data)
			}
		}

	} else if (file === 'package.json5') {
		if (!old_data) {
			return json2json(new_data)
		} else {
			return require('json5-utils').update(old_data, JSON.parse(new_data))
		}

	} else {
		if (!old_data) {
			return new_data
		} else {
			return require('json5-utils').update(old_data, JSON.parse(new_data), {mode: 'json'})
		}
	}
}

fs.writeFile = function(path, data) {
	if (Path.basename(path) === 'package.json') {
		var orig_args = arguments
		var args = Array.prototype.slice.apply(orig_args)

		check_override(module.exports.formats.slice(0))
	} else {
		orig_writeFile.apply(fs, arguments)
	}

	function check_override(list) {
		var alt_file = list.shift()
		args[0] = Path.join(Path.dirname(path), alt_file)
		
		orig_readFile(args[0], 'utf8', function(err, olddata) {
			if (err) {
				// alt_file doesn't exist, looking for next one
				if (list.length) {
					return check_override(list)
				} else {
					alt_file = module.exports.formats[0] || 'package.json'
					args[0] = Path.join(Path.dirname(path), alt_file)
					old_data = undefined

					/* fallthrough */
				}
			}

			// alt_file exists, so assuming that user works with this format
			data = update(alt_file, olddata, data)
			args[1] = data
console.log('!!!', module.exports.formats)
			orig_writeFile.apply(fs, args)
		})
	}
}

fs.writeFileSync = function(path, data) {
	if (Path.basename(path) === 'package.json') {
		var ypath = Path.join(Path.dirname(path), 'package.yaml')
		var args = Array.prototype.slice.apply(arguments)

		function write_yaml() {
			args[0] = ypath
			try {
				var result = fs.readFileSync(args[0], 'utf8')
			} catch(err) {}
			if (result) {
				try {
					args[1] = require('yaml-update').edit(result, data)
				} catch(err) {
					console.log('| yapm warning: can\'t update package.yaml without rewriting the file: ', err)
					console.log('| if you think it\'s an error, report it here: https://github.com/rlidwka/yapm/issues')
					args[1] = json2yaml(data)
				}
			} else {
				args[1] = json2yaml(data)
			}
			return orig_writeFileSync.apply(fs, args)
		}

		function write_json() {
			return orig_writeFileSync.apply(fs, args)
		}

		if (orig_existsSync(ypath)) {
			return write_yaml()
		} else {
			if (orig_existsSync(path)) {
				return write_json()
			} else {
				return write_yaml()
			}
		}
	} else {
		return orig_writeFileSync.apply(fs, arguments)
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
var orig = fs.createWriteStream
fs.createWriteStream = function() {
	console.log(arguments)
	throw new Error()
	return orig.apply(fs, arguments)
}*/

