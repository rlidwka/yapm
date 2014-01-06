var yaml = require('js-yaml');
var assert = require('assert');

function apply_changes(data, delete_tags, insert_tags, replace_tags) {
	var result = [];
	var main_indent = null;
	var insert = null;
	data = data.split('\n');
	while(data.length) {
		var line = data.shift();

		// comments and empty lines
		if (line.match(/^\s*#/) || line.match(/^\s*$/)) {
			result.push(line);
			continue;
		}

		var m = line.match(/^(\s*)\S/);
		if (m) {
			if (main_indent === null) {
				main_indent = m[1];
			} else if (main_indent.length > m[1].length) {
				throw new Error('weird indentation');
			} else if (main_indent.length < m[1].length) {
				result.push(line);
				continue;
			}
		}

		var mline = line.substr(main_indent.length);
		if (m = mline.match(/^((("[^"]*")|('[^']*')|(.*?))\s*:\s*)/)) {
			var key = m[3] || m[4] || m[5];
			if (replace_tags[key] || delete_tags[key]) {
				var idx = String(Math.random()).replace(/0./, 'x');
				var ins_data = {};
				if (replace_tags[key]) {
					ins_data[idx] = replace_tags[key];
					var insert = yaml.safeDump(ins_data).replace(idx+': ', m[1]).replace(/\n$/, '');
				} else if (delete_tags[key]) {
					var insert = null;
				}
				line = null;

				while(data.length && insert != null) {
					var line = data.shift();
					var m = line.match(/^(\s*)\S/);
					if (m) {
						if (main_indent.length >= m[1].length) {
							if (insert != null) {
								result.push.apply(result, insert.split('\n').map(function(x) {
									return main_indent + x;
								}));
								insert = null;
							}
							data.unshift(line);
							line = null;
						}
					}
				}

				if (insert != null) {
					result.push.apply(result, insert.split('\n').map(function(x) {
						return main_indent + x;
					}));
					insert = null;
				}
			}
		}

		if (line != null) result.push(line);
		continue;
	}

	for (var key in insert_tags) {
		var ins_data = {};
		ins_data[key] = insert_tags[key];
		var insert = yaml.safeDump(ins_data).replace(/\n$/, '');
		result.push.apply(result, insert.split('\n'));
	}
	return result.join('\n');
}

module.exports.edit = function editor(data, json) {
	var delete_tags = {};
	var insert_tags = {};
	var replace_tags = {};

	var new_data = JSON.parse(json);
	var old_data = yaml.safeLoad(data);

	for (var i in new_data) {
		if (old_data[i] == null) {
			insert_tags[i] = new_data[i];
		} else if (JSON.stringify(old_data[i]) !== JSON.stringify(new_data[i])) {
			replace_tags[i] = new_data[i];
		}
	}

	for (var i in old_data) {
		if (new_data[i] == null) {
			delete_tags[i] = old_data[i];
		}
	}

	var result = apply_changes(data, delete_tags, insert_tags, replace_tags);
	assert.deepEqual(yaml.safeLoad(result), new_data);
	return result;
}

