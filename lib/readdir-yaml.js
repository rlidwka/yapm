var fs = require('fs')
  , Path = require('path')

var orig_readdir = fs.readdir
  , orig_readdirSync = fs.readdirSync

function check_yaml(arr) {
	var something = 0, json = 0
	if (Array.isArray(arr)) {
		for (var i=0; i<arr.length; i++) {
			if (module.exports.formats.indexOf(arr[i]) !== -1) something++
			if (arr[i] === 'package.json') json++
		}
		if (something && !json) arr.push('package.json')
	}
	return arr
}

fs.readdir = function(path, callback) {
	orig_readdir(path, function(err, res) {
		callback(err, check_yaml(res))
	})
}

//fs.existsSync = function(path) {
//	return check_yaml(orig_readdirSync(path))
//}

