/*
 * Author: Alex Kocharin <alex@kocharin.ru>
 * GIT: https://github.com/rlidwka/jju
 * License: WTFPL, grab your copy here: http://www.wtfpl.net/txt/copying/
 */

var assert = require('assert')
  , parse = require('./parse').parse
  , tokenize = require('./parse').tokenize
  , stringify = require('./stringify').stringify

function isObject(x) {
	return typeof(x) === 'object' && x !== null
}

function value_to_tokenlist(value, stack, options, is_key) {
	options._stringify_key = !!is_key
	var stringified = stringify(value, options)

	if (is_key) {
		return [ { raw: stringified, type: 'literal', stack: stack, value: value } ]
	}

	options._addstack = stack
	var result = tokenize(stringified, {
		_addstack: stack,
	})
	result.data = null
	options._addstack = null
	return result
}

// '1.2.3' -> ['1','2','3']
function arg_to_path(path) {
	// array indexes
	if (typeof(path) === 'number') path = String(path)

	if (path === '') path = []
	if (typeof(path) === 'string') path = path.split('.')

	if (!Array.isArray(path)) throw new Error('Invalid path type, string or array expected')
	return path
}

// returns new [begin, end] or false if not found
//
//          {x:3, xxx: 111, y: [111,  {q: 1, e: 2}  ,333]  }
// f('y',0) returns this       B^^^^^^^^^^^^^^^^^^^^^^^^E
// then f('1',1) would reduce it to   B^^^^^^^^^^E
function find_element_in_tokenlist(element, lvl, tokens, begin, end) {
	while(tokens[begin].stack[lvl] != element) {
		if (begin++ >= end) return false
	}
	while(tokens[end].stack[lvl] != element) {
		if (end-- < begin) return false
	}
	return [begin, end]
}

function find_first_non_ws_token(tokens, begin, end) {
	while(tokens[begin].type === 'whitespace' || tokens[begin].type === 'comment') {
		if (begin++ >= end) return false
	}
	return begin
}

function find_last_non_ws_token(tokens, begin, end) {
	while(tokens[end].type === 'whitespace' || tokens[end].type === 'comment') {
		if (end-- < begin) return false
	}
	return end
}

function Document(text, options) {
	if (!(this instanceof Document)) return new Document(text, options)

	if (options == null) options = {}
	//options._structure = true
	var tokens = this._tokens = tokenize(text, options)
	this._data = tokens.data
	tokens.data = null
	this._options = options
}

// return true if it's a proper object
//        throw otherwise
function check_if_can_be_placed(key, object, is_unset) {
	//if (object == null) return false
	function error(add) {
		return new Error("You can't " + (is_unset ? 'unset' : 'set') + " key '" + key + "'" + add)
	}	

	if (!isObject(object)) {
		throw error(" of an non-object")
	}
	if (Array.isArray(object)) {
		// array, check boundary
		if (String(key).match(/^\d+$/)) {
			key = Number(String(key))
			if (object.length < key || (is_unset && object.length === key)) {
				throw error(", out of bounds")
			} else if (is_unset && object.length !== key+1) {
				throw error(" in the middle of an array")
			} else {
				return true
			}
		} else {
			throw error(" of an array")
		}
	} else {
		// object
		return true
	}
}

// usage: document.set('path.to.something', 'value')
//    or: document.set(['path','to','something'], 'value')
Document.prototype.set = function(path, value) {
	path = arg_to_path(path)

	// updating this._data and check for errors
	if (path.length === 0) {
		if (value === undefined) throw new Error("can't remove root document")
		this._data = value
		var new_key = false

	} else {
		var data = this._data

		for (var i=0; i<path.length-1; i++) {
			check_if_can_be_placed(path[i], data, false)
			data = data[path[i]]
		}
		if (i === path.length-1) {
			check_if_can_be_placed(path[i], data, value === undefined)
		}

		var new_key = !(path[i] in data)

		if (value === undefined) {
			if (Array.isArray(data)) {
				data.pop()
			} else {
				delete data[path[i]]
			}
		} else {
			data[path[i]] = value
		}
	}

	// for inserting document
	if (!this._tokens.length)
		this._tokens = [ { raw: '', type: 'literal', stack: [], value: undefined } ]

	var position = [
		find_first_non_ws_token(this._tokens, 0, this._tokens.length - 1),
		find_last_non_ws_token(this._tokens, 0, this._tokens.length - 1),
	]
	for (var i=0; i<path.length-1; i++) {
		position = find_element_in_tokenlist(path[i], i, this._tokens, position[0], position[1])
		if (position == false) throw new Error('internal error, please report this')
	}
	// assume that i == path.length-1 here

	var newtokens = value_to_tokenlist(value, path, this._options)

	if (path.length === 0) {
		// all good

	} else if (!new_key) {
		// replace old value with a new one (or deleting something)
		var pos_old = position
		position = find_element_in_tokenlist(path[i], i, this._tokens, position[0], position[1])

		if (value === undefined && position !== false) {
			// deleting element (position !== false ensures there's something)

			if (!Array.isArray(data)) {
				// removing element from an object, `{x:1, key:CURRENT} -> {x:1}`
				// removing sep, literal and optional sep
				// ':'
				var pos2 = find_last_non_ws_token(this._tokens, pos_old[0], position[0] - 1)
				assert.equal(this._tokens[pos2].type, 'separator')
				assert.equal(this._tokens[pos2].raw, ':')
				position[0] = pos2

				// key
				var pos2 = find_last_non_ws_token(this._tokens, pos_old[0], position[0] - 1)
				assert.equal(this._tokens[pos2].type, 'literal')
				assert.equal(this._tokens[pos2].value, path[path.length-1])
				position[0] = pos2
			}

			// removing comma in arrays and objects
			var pos2 = find_last_non_ws_token(this._tokens, pos_old[0], position[0] - 1)
			assert.equal(this._tokens[pos2].type, 'separator')
			if (this._tokens[pos2].raw === ',') {
				position[0] = pos2
			} else {
				// beginning of the array/object, so we should remove trailing comma instead
				pos2 = find_first_non_ws_token(this._tokens, position[1] + 1, pos_old[1])
				assert.equal(this._tokens[pos2].type, 'separator')
				if (this._tokens[pos2].raw === ',') {
					position[1] = pos2
				}
			}
		}

	} else {
		// insert new key, that's tricky
		var path_1 = path.slice(0, i-1)

		if (!Array.isArray(data)) {
			newtokens.unshift({raw: ':', type: 'separator', stack: path_1})
			newtokens.unshift.apply(newtokens, value_to_tokenlist(path[path.length-1], path_1, this._options, true))
		}

		//	find a last separator after which we're inserting it
		var pos2 = find_last_non_ws_token(this._tokens, position[0] + 1, position[1] - 1)
		if (pos2 !== false) {
			// check if prev token is a separator AND they're at the same level
			if (this._tokens[pos2].type === 'separator' && this._tokens[pos2].stack.length === path.length-1) {
				// previous token is either , or [ or {

				if (this._tokens[pos2].raw === ',') {
					// restore ending comma
					newtokens.push({raw: ',', type: 'separator', stack: path_1})
				}
			} else {
				// previous token isn't a separator, so need to insert one
				newtokens.unshift({raw: ',', type: 'separator', stack: path_1})
			}
		}

		assert.equal(this._tokens[position[1]].type, 'separator')
		position[0] = position[1]
		position[1]--
	}

	newtokens.unshift(position[1] - position[0] + 1)
	newtokens.unshift(position[0])
	this._tokens.splice.apply(this._tokens, newtokens)

	return this
}

// convenience method
Document.prototype.unset = function(path) {
	return this.set(path, undefined)
}

Document.prototype.get = function(path) {
	path = arg_to_path(path)

	var data = this._data
	for (var i=0; i<path.length; i++) {
		if (!isObject(data)) return undefined
		data = data[path[i]]
	}
	return data
}

Document.prototype.has = function(path) {
	path = arg_to_path(path)

	var data = this._data
	for (var i=0; i<path.length; i++) {
		if (!isObject(data)) return false
		data = data[path[i]]
	}
	return data !== undefined
}

// compare old object and new one, and change differences only
Document.prototype.update = function(value) {
	var self = this
	change([], self._data, value)
	return self

	function change(path, old_data, new_data) {
		if (!isObject(new_data) || !isObject(old_data)) {
			// if source or dest is primitive, just replace
			self.set(path, new_data)

		} else if (Array.isArray(new_data) != Array.isArray(old_data)) {
			// old data is an array XOR new data is an array, replace as well
			self.set(path, new_data)

		} else if (Array.isArray(new_data)) {
			// both values are arrays here

			if (new_data.length > old_data.length) {
				// adding new elements, so going forward
				for (var i=0; i<new_data.length; i++) {
					path.push(String(i))
					change(path, old_data[i], new_data[i])
					path.pop()
				}

			} else {
				// removing something, so going backward
				for (var i=old_data.length-1; i>=0; i--) {
					path.push(String(i))
					change(path, old_data[i], new_data[i])
					path.pop()
				}
			}

		} else {
			// both values are objects here
			for (var i in new_data) {
				path.push(String(i))
				change(path, old_data[i], new_data[i])
				path.pop()
			}

			for (var i in old_data) {
				if (i in new_data) continue
				path.push(String(i))
				change(path, old_data[i], new_data[i])
				path.pop()
			}
		}
	}
}

Document.prototype.toString = function() {
	return this._tokens.map(function(x) {
		return x.raw
	}).join('')
}

module.exports.Document = Document

module.exports.update = function updateJSON(source, new_value, options) {
	return (new Document(source, options)).update(new_value).toString()
}

