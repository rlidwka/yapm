var url = require("url")
  , npm = require("../../")
  , assert = require("assert")
  , log = require("npmlog")
  , lookup = require("gh-lookup")
  , addRemoteGit = require("./add-remote-git.js")
  , addRemoteTarball = require("./add-remote-tarball.js")

module.exports = function maybeGithub (p, name, er, cb) {
  assert(typeof p === "string", "must pass package name")
  assert(er instanceof Error, "must include error")
  assert(typeof cb === "function", "must pass callback")
  if (~p.indexOf('@')) {
    // github semver support, i.e. "npm install visionmedia/express@3"
    var key = p.split('@')[0]
    var val = p.split('@')[1]

    var token = npm.config.get('github-token')

    lookup({
      token: token,
      version: val,
      repo: key
    }, function (err, release) {
      if (err) return cb(err)
      if (!release) return cb(new Error('failed to find release of ' + key + '@' + val))
      var url = token
        ? release.tarball_url + '?access_token=' + token
        : release.tarball_url

      addRemoteTarball(url, null, name, release.name, cb)
    })

    return
  }

  // preserve old github behaviour if it has no semver attached
  // maybe fetch tarball here instead of git clone?
  var u = "git://github.com/" + p
    , up = url.parse(u)
  log.info("maybeGithub", "Attempting %s from %s", p, u)

  return addRemoteGit(u, up, true, function (er2, data) {
    if (er2) {
      var upriv = "git+ssh://git@github.com:" + p
        , uppriv = url.parse(upriv)

      log.info("maybeGithub", "Attempting %s from %s", p, upriv)

      return addRemoteGit(upriv, uppriv, false, function (er3, data) {
        if (er3) return cb(er)
        success(upriv, data)
      })
    }
    success(u, data)
  })

  function success (u, data) {
    data._from = u
    data._fromGithub = true
    return cb(null, data)
  }
}
