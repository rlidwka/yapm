/**
 * Module dependencies.
 */

var request = require('request');
var assert = require('assert');

/**
 * Fetch releases with `opts`:
 *
 * - `token` github token
 * - `repo` username/project
 *
 * @param {Object} opts
 * @param {Function} fn
 * @api public
 */

module.exports = function(opts, fn){
  assert(opts, 'config required');
  assert(opts.repo, 'github repo required');
  tags(opts, fn);
};

/**
 * Fetch tags.
 */

function tags(pkg, fn) {
  var url = releases(pkg);
  var auth = pkg.user + ':' + pkg.pass;

  var opts = {
    url: url,
    headers: { 'User-Agent': 'npm' },
    json: true
  };

  if (pkg.token) opts.headers.Authorization = 'Bearer ' + pkg.token;

  request(opts, function(err, res, body){
    if (err) throw err;
    fn(null, body);
  });
}
/**
 * Return tags url.
 */

function releases(opts) {
  return 'https://api.github.com/repos/' + opts.repo + '/tags';
}