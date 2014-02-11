/*
 * Author: Alex Kocharin <alex@kocharin.ru>
 * GIT: https://github.com/rlidwka/jju
 * License: WTFPL, grab your copy here: http://www.wtfpl.net/txt/copying/
 */

var assert = require('assert')
  , tokenize = require('./parse').tokenize

module.exports.analyze = function analyzeJSON(input, options) {
	if (options == null) options = {}

	if (!Array.isArray(input)) {
		input = tokenize(input, options)
	}

	var result = {
		has_whitespace: false,
		has_comments: false,
		has_newlines: false,
		indent: '',
		newline: '\n',
	}

	var stats = {
		indent: {},
		newline: {},
	}

	for (var i=0; i<input.length; i++) {
		if (input[i].type === 'newline') {
			if (input[i+1] && input[i+1].type === 'whitespace') {
				if (input[i+1].raw[0] === '\t') {
					// if first is tab, then indent is tab
					stats.indent['\t'] = (stats.indent['\t'] || 0) + 1
				}
				if (input[i+1].raw.match(/^\x20+$/)) {
					// if all are spaces, then indent is space
					// this can fail with mixed indent (4, 2 would display 3)
					var ws_len = input[i+1].raw.length
					var indent_len = input[i+1].stack.length + 1
					if (ws_len % indent_len === 0) {
						var t = Array(ws_len / indent_len + 1).join(' ')
						stats.indent[t] = (stats.indent[t] || 0) + 1
					}
				}
			}

			stats.newline[input[i].raw] = (stats.newline[input[i].raw] || 0) + 1
		}

		if (input[i].type === 'newline') {
			result.has_newlines = true
		}
		if (input[i].type === 'whitespace') {
			result.has_whitespace = true
		}
		if (input[i].type === 'comment') {
			result.has_comments = true
		}
	}

	for (var k in stats) {
		if (Object.keys(stats[k]).length) {
			result[k] = Object.keys(stats[k]).reduce(function(a, b) {
				return stats[k][a] > stats[k][b] ? a : b
			})
		}
	}

	return result
}

