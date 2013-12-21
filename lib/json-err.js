
// This module parses json using jju as a fallback.
//
// Primary reason to do that is because jju provide an error message
// with an exact position of an occured error.

try {
	var j5parse = require('jju').parse

	var _parse = JSON.parse
	JSON.parse = function(text, rev) {
		try {
			return _parse(text, rev)
		} catch(err) {
			return j5parse(text, {
				mode: 'json',
				legacy: true,
				reviver: rev,
				reserved_keys: 'replace',
				null_prototype: false,
			})
		}
	}
} catch(err) {}

