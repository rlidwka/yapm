var test = require('tap').test

var yaml = require('js-yaml')
  , fs = require('fs')

var read = fs.readFileSync
  , write = fs.writeFileSync
  , unlink = fs.unlinkSync
  , exists = fs.existsSync

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

// testing if we're able to fool node.js module loader
test('yapm - module loader', function(t) {
  var Y = yaml.safeLoad(require('fs').readFileSync(__dirname + '/yapm-fixtures/package.yaml', 'utf8'))
  Y.main = 'blablabla.js'
  require('../../')

  write('blablabla.js', 'module.exports = "PASSED"')
  t.equal(require('./blablabla'), "PASSED")
  t.throws(function() { require('./') })
  write('package.json', JSON.stringify(Y))
  t.equal(require('./'), "PASSED")
  unlink('blablabla.js')
  unlink('package.json')
  t.end()
})

