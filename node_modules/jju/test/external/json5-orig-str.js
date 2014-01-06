// tests stringify()

/*global require console exports */

var JSON5 = {}
JSON5.prototype = {toString: "[object JSON]"}

JSON5.parse = function(x) {
	return require('../../').parse(x)
}

JSON5.stringify = function(x, _, indent) {
	return require('../../').stringify(x, {indent: indent || false, quote: '"'})
}

process.nextTick(function() {
	for (var x in module.exports) {
	for (var y in module.exports[x]) {
		module.exports[x][y]()
	}
	}
});


// set to true to show performance stats
var DEBUG = false;

var assert = require('assert');

// Test JSON5.stringify() by comparing its output for each case with 
// native JSON.stringify().  The only differences will be in how object keys are 
// handled.

exports.stringify = {};
exports.stringify.simple = function test() {
	assertStringify();
	assertStringify(null);
	assertStringify(9);
	assertStringify(-9);
	assertStringify(+9);
	assertStringify(+9.878);
	assertStringify('');
	assertStringify("''");
	assertStringify('999');
	assertStringify('9aa');
	assertStringify('aaa');
	assertStringify('aa a');
	assertStringify('aa\na');
	assertStringify('aa\\a');
	assertStringify('\'');
	assertStringify('\\\'');
	assertStringify('\\"');
	assertStringify(undefined);
	assertStringify(true);
	assertStringify(false);
	assertStringify({});
	assertStringify([]);
	assertStringify(function() {});
	assertStringify(Date.now());
	assertStringify(new Date(Date.now()));
};	

exports.stringify.oddities = function test() {
	assertStringify(Function);
	assertStringify(Date);
	assertStringify(Object);
	//assertStringify(NaN);
	//assertStringify(Infinity);
	assertStringify(10e6);
	assertStringify(19.3223e6);
	assertStringify(077);
	assertStringify(0x99);
	assertStringify(/aa/);
	assertStringify(new RegExp('aa'));
	
	assertStringify(new Number(7));
	assertStringify(new String(7));
	assertStringify(new String(""));
	assertStringify(new String("abcde"));
	assertStringify(new String(new String("abcde")));
	assertStringify(new Boolean(true));
	assertStringify(new Boolean());
};

exports.stringify.arrays = function test() {
	assertStringify([""]);
	assertStringify([1, 2]);
	assertStringify([undefined]);
	assertStringify([1, 'fasds']);
	assertStringify([1, '\n\b\t\f\r\'']);
	assertStringify([1, 'fasds', ['fdsafsd'], null]);
	assertStringify([1, 'fasds', ['fdsafsd'], null, function(aaa) { return 1; }, false ]);
	assertStringify([1, 'fasds', ['fdsafsd'], undefined, function(aaa) { return 1; }, false ]);
};

exports.stringify.oddKeys = function test() {
	assertStringify({"this is a crazy long key":1});
	assertStringify({"":1, '1bbbb':2});
	assertStringify({"s\ns":1, '1bbbb':2});
	assertStringify({'\n\b\t\f\r\'\\':1, '1bbbb':2});
};


function stringifyJSON5(obj, reviver, space) {
	var start, res, end;
	try {
		start = new Date();
		res = JSON5.stringify(obj, null, space);
		end = new Date();
	} catch (e) {
		res = e.message;
		end = new Date();
	}
	if (DEBUG) {
		console.log('JSON5.stringify time: ' + (end-start));
		console.log(res);
	}
	return res;
}

function stringifyJSON(obj, reviver, space) {
	var start, res, end;
	
	try {
		start = new Date();
		res = JSON.stringify(obj, null, space);
		end = new Date();
	
		// now remove all quotes from keys where appropriate
		// first recursively find all key names
		var keys = [];
		
		// now replace each key in the result
		var last = 0;
		for (var i = 0; i < keys.length; i++) {
		
			// not perfect since we can match on parts of the previous value that 
			// matches the key, but we can design our test around that.
			last = res.indexOf('"' + keys[i] + '"', last);
			if (last === -1) {
				// problem with test framework
				console.log("Couldn't find: " + keys[i]);
				throw new Error("Couldn't find: " + keys[i]);
			}
			res = res.substring(0, last) + 
				res.substring(last+1, last + keys[i].length+1) + 
				res.substring(last + keys[i].length + 2, res.length);
			last += keys[i].length;
		}
	} catch (e) {
		res = e.message;
		end = new Date();
	}
	if (DEBUG) {
		console.log('JSON.stringify time: ' + (end-start));
	}
	return res;
}

function assertStringify(obj, expectError) {
	var j5, j;
	
	j5 = stringifyJSON5(obj);
	j = stringifyJSON(obj);
	assert.equal(j5, j);
	
	if (!expectError) {
		// no point in round tripping if there is an error
		var origStr = JSON5.stringify(obj), roundTripStr;
		if (origStr !== "undefined" && typeof origStr !== "undefined") {
			try {
				roundTripStr = JSON5.stringify(JSON5.parse(origStr));
			} catch (e) {
				console.log(e);
				console.log(origStr);	
				throw e;
			}
			assert.equal(origStr, roundTripStr);
		}
	}
}
