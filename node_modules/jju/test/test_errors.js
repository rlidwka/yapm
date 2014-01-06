var assert = require('assert')
var parse = require('../').parse

function addTest(arg, row, col) {
	var fn = function() {
		try {
			parse(arg)
		} catch(err) {
			if (row !== undefined) assert.equal(err.row, row, 'wrong row: ' + err.row)
			if (col !== undefined) assert.equal(err.column, col, 'wrong column: ' + err.column)
			return
		}
		throw new Error("no error")
	}

	if (typeof(describe) === 'function') {
		it('test_errors: ' + JSON.stringify(arg), fn)
	} else {
		fn()
	}
}

// semicolon will be unexpected, so it indicates an error position
addTest(';', 1, 1)
addTest('\n\n\n;', 4, 1)
addTest('\r\n;', 2, 1)
addTest('\n\r;', 3, 1)
addTest('\n\u2028;', 3, 1)
addTest('\n\u2029;', 3, 1)
addTest('[\n1\n,\n;', 4, 1)
addTest('{\n;', 2, 1)
addTest('{\n1\n:\n;', 4, 1)

// line continuations
addTest('["\\\n",\n;', 3, 1)
addTest('["\\\r\n",\n;', 3, 1)
addTest('["\\\u2028",\n;', 3, 1)
addTest('["\\\u2029",\n;', 3, 1)

// bareword rewind
addTest('nulz', 1, 1)

