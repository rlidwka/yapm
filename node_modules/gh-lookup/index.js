
/**
 * Module dependencies.
 */

var releases = require('gh-releases');
var semver = require('semver');
var assert = require('assert');

/**
 * Lookup release.
 *
 * - `token` github token
 * - `repo` github repo
 * - `version` version to match
 *
 * @param {Object} obj
 * @param {Function} fn
 * @api public
 */

module.exports = function(opts, fn){
  assert(opts.version, 'version required');
  releases(opts, function(err, tags){
    if (err) return fn(err);

    try {
      var tag = find(opts, tags);
    } catch (err) {
      return fn(err);
    }

    fn(null, tag);
  });
};

/**
 * Find a release in `tags` that
 * satisfies `pkg.version`.
 */

function find(pkg, tags) {
  for (var i = 0; i < tags.length; i++) {
    var tag = tags[i];
    if (semver.satisfies(tag.name, pkg.version)) {
      return tag;
    }
  }
}