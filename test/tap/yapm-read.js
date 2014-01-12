var test = require('tap').test

var yaml = require('js-yaml')
  , fs = require('fs')

var read = fs.readFileSync
  , write = fs.writeFileSync
  , unlink = fs.unlinkSync
  , exists = fs.existsSync
  , tests = []

process.chdir(__dirname)
test('starting-cleanup', function (t) {
  try {
    unlink('package.json')
  } catch(e) {}
  try {
    unlink('package.yaml')
  } catch(e) {}
  try {
    unlink('package.json5')
  } catch(e) {}
  t.end()
})

var Y = yaml.safeLoad(require('fs').readFileSync(__dirname + '/yapm-fixtures/package.yaml', 'utf8'))
Y.test_nonascii = '\u0442\u0435\u0441\u0442'
var J5 = {test:123,something:456}
var J5str = '{test:123,something:456}'
require('../..')

// no config file exists just yet
test('nothing#sync', function(t) {
  t.throws(function() {
    console.log(fs.readFileSync('package.json'))
  })
  t.end()
})

test('nothing#async', function(t) {
  fs.readFile('package.json', function(err) {
    t.ok(err)
    t.end()
  })
})

// testing package.json without yaml
test('json#prepare', function(t) {
  write('package.json', JSON.stringify(Y))
  t.end()
})

test('json#sync', function(t) {
  t.deepEqual(JSON.parse(fs.readFileSync('package.json', 'utf8')), Y)
  t.end()
})

test('json#async', function(t) {
  fs.readFile('package.json', 'utf8', function(err, data) {
    t.ok(!err)
    t.deepEqual(JSON.parse(data), Y)
    t.end()
  })
})

// without encoding
test('json#sync2', function(t) {
  t.deepEqual(JSON.parse(fs.readFileSync('package.json').toString('utf8')), Y)
  t.end()
})

test('json#async2', function(t) {
  fs.readFile('package.json', function(err, data) {
    t.ok(!err)
    t.deepEqual(JSON.parse(data.toString('utf8')), Y)
    t.end()
  })
})

// testing both - should read yaml!
test('both#prepare', function(t) {
  write('package.json', '{"garbage":"garbage"}')
  write('package.yaml', yaml.safeDump(Y))
  t.end()
})

test('both#sync', function(t) {
  t.deepEqual(JSON.parse(fs.readFileSync('package.json', 'utf8')), Y)
  t.end()
})

test('both#async', function(t) {
  fs.readFile('package.json', 'utf8', function(err, data) {
    t.ok(!err)
    t.deepEqual(JSON.parse(data), Y)
    t.end()
  })
})

// testing package.yaml without json
test('yaml#prepare', function(t) {
  unlink('package.json')
  t.end()
})

test('yaml#sync', function(t) {
  t.deepEqual(JSON.parse(fs.readFileSync('package.json', 'utf8')), Y)
  t.end()
})

test('yaml#async', function(t) {
  fs.readFile('package.json', 'utf8', function(err, data) {
    t.ok(!err)
    t.deepEqual(JSON.parse(data), Y)
    t.end()
  })
})

test('yaml#doubleerr', function(t) {
  var count = 0
  fs.readFile('package.yaml/package.json', function(err) {
    t.equal(err.code, 'ENOTDIR')
    if (count++) {
      throw new Error('doubleerr callback invocation')
    }
    t.end()
  })
})

test('yaml#doubleerr', function(t) {
  var count = 0
  fs.readFile('package.yaml/package.json', function(err) {
    t.equal(err.code, 'ENOTDIR')
    if (count++) {
      throw new Error('doubleerr callback invocation')
    }
    t.end()
  })
})

test('json5+yaml#sync', function(t) {
  t.deepEqual(JSON.parse(fs.readFileSync('package.json', 'utf8')), Y)
  t.end()
})

test('json5#prepare', function(t) {
  unlink('package.yaml')
  write('package.json5', J5str)
  t.end()
})

test('json5#sync', function(t) {
  t.deepEqual(JSON.parse(fs.readFileSync('package.json', 'utf8')), J5)
  t.end()
})

test('json5#async', function(t) {
  fs.readFile('package.json', 'utf8', function(err, data) {
    t.ok(!err)
    t.deepEqual(JSON.parse(data), J5)
    t.end()
  })
})

test('cleanup', function(t) {
  unlink('package.json5')
  t.end()
})

test('ending-cleanup', function (t) {
  try {
    unlink('package.json')
  } catch(e) {}
  try {
    unlink('package.yaml')
  } catch(e) {}
  t.end()
})
