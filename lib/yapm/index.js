
var formats = {
	'yaml': 3,
	'json5': 2,
	'json': 1,
}

// provide '--yapm-formats=json5,yaml' option
for (var i=2; i<process.argv.length; i++) {
	var m
	if (m = process.argv[i].match(/^--yapm-formats=(.*)$/)) {
		m = m[1].split(',')
		for (var j=m.length-1; j>=0; j--) {
			if (formats[m[j]] != null) {
				formats[m[j]] = 10 + m.length - j
			} else {
				throw new Error('unsupported format: ' + m[j])
			}
		}
		break
	}
}

formats = Object.keys(formats).sort(function(x, y) {
	return formats[y] - formats[x]
}).map(function(x) {
	return 'package.' + x
})

// overwriting fs.writeFile[Sync]
// should be before read
require('./write-yaml').formats = formats

// overwriting fs.readFile[Sync]
require('./read-yaml').formats = formats

// overwriting fs.readdir[Sync]
require('./readdir-yaml').formats = formats

// overwriting fs.createWriteStream, fs.lstat
// probably should be after read-yaml
require('./streams').formats = formats

// overwriting child_process.execFile
// for 'git add package.json' executed by 'npm version'
require('./exec-git').formats = formats

// overwrite JSON.parse
require('./json-err').formats = formats

