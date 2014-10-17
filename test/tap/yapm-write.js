var test = require('tap').test

var yaml = require('js-yaml')
var fs = require('fs')
var pkgyaml = require('package-yaml')

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
require('../..')

// no config file exists just yet
test('nothing#async', function (t) {
  pkgyaml.write('.', Y, function(err, res) {
    t.ok(!err)
    t.ok(!exists('package.json'))
    t.deepEqual(yaml.safeLoad(read('package.yaml').toString('utf8')), Y)
    unlink('package.yaml')
    t.end()
  })
})

// creating package.json, should write there
test('json#async', function (t) {
  write('package.json', '{"garbage":"garbage"}', 'utf8')
  pkgyaml.write('.', Y, function(err, res) {
    t.ok(!err)
    t.ok(!exists('package.yaml'))
    t.deepEqual(JSON.parse(read('package.json').toString('utf8')), Y)
    unlink('package.json')
    t.end()
  })
})

test('yaml#async', function (t) {
  write('package.yaml', 'garbage: garbage', 'utf8')
  pkgyaml.write('.', Y, function(err, res) {
    t.ok(!err)
    t.ok(!exists('package.json'))
    t.deepEqual(yaml.safeLoad(read('package.yaml').toString('utf8')), Y)
    unlink('package.yaml')
    t.end()
  })
})

// both exist, so writing to yaml
test('both#async', function (t) {
  write('package.json', '{"garbage":1}', 'utf8')
  write('package.yaml', 'garbage: 1', 'utf8')
  pkgyaml.write('.', Y, function(err, res) {
    t.ok(!err)
    t.deepEqual(yaml.safeLoad(read('package.yaml').toString('utf8')), Y)
    t.deepEqual(JSON.parse(read('package.json').toString('utf8')), {garbage: 1})
    t.end()
  })
})

test('cleanup', function (t) {
  try {
    unlink('package.json')
  } catch(e) {}
  try {
    unlink('package.yaml')
  } catch(e) {}
  t.end()
})
