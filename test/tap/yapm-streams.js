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

function check_stream(should_be, t) {
  var stream = fs.createReadStream('package.json')
  //stream.setEncoding('utf8')
  var data = ''
  stream.on('data', function(d) {
    data += d
  })
  stream.on('end', function () {
    t.equal(data, should_be)
    t.end()
  })
  stream.on('error', function(err) {
    throw err
  })
}

// no config file exists just yet
test('nothing#lstat', function (t) {
  fs.lstat('package.json', function(err) {
    t.ok(err)
    t.end()
  })
})

test('nothing#stream', function (t) {
  var stream = fs.createReadStream('package.json')
  stream.on('data', function () {
    throw 'data?'
  })
  stream.on('end', function () {
    throw 'end?'
  })
  stream.on('error', function(err) {
    t.equal(err.code, 'ENOENT')
    t.end()
  })
})

// testing package.json without yaml
test('json#prepare', function (t) {
  write('package.json', JSON.stringify(Y))
  t.end()
})

test('json#lstat', function (t) {
  fs.lstat('package.json', function(err, data) {
    t.ok(!err)
    t.equal(data.size, (new Buffer(JSON.stringify(Y))).length)
    t.end()
  })
})

test('json#stream', function (t) {
  check_stream(JSON.stringify(Y), t)
})

// testing both - should read yaml!
test('both#prepare', function (t) {
  write('package.yaml', JSON.stringify(Y))
  write('package.json', '{"garbage":"garbage"}')
  t.end()
})

test('both#lstat', function (t) {
  fs.lstat('package.json', function(err, data) {
    t.ok(!err)
    t.equal(data.size, JSON.stringify(Y).length)
    t.end()
  })
})

test('both#stream', function (t) {
  check_stream(JSON.stringify(Y), t)
})

// testing package.yaml without json
test('yaml#prepare', function (t) {
  unlink('package.json')
  t.end()
})

test('yaml#lstat', function (t) {
  fs.lstat('package.json', function(err, data) {
    t.ok(!err)
    t.equal(data.size, JSON.stringify(Y).length)
    t.end()
  })
})

test('yaml#stream', function (t) {
  check_stream(JSON.stringify(Y), t)
})

// testing package.json5 without json
test('json5#prepare', function (t) {
  unlink('package.yaml')
  write('package.json5', J5str)
  t.end()
})

test('json5#lstat', function (t) {
  fs.lstat('package.json', function(err, data) {
    t.ok(!err)
    t.equal(data.size, JSON.stringify(J5).length)
    t.end()
  })
})

test('json5#stream', function (t) {
  check_stream(JSON.stringify(J5), t)
})

test('cleanup', function (t) {
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
