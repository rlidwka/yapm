// npm version <newver>

module.exports = version

var semver = require("semver")
  , path = require("path")
  , fs = require("graceful-fs")
  , writeFileAtomic = require("write-file-atomic")
  , chain = require("slide").chain
  , log = require("npmlog")
  , which = require("which")
  , pkgyaml = require("package-yaml")
  , npm = require("./npm.js")
  , git = require("./utils/git.js")

version.usage = "npm version [<newversion> | major | minor | micro | prerelease | preminor | premajor ]\n"
              + "\n(run in package dir)\n"
              + "'npm -v' or 'npm --version' to print npm version "
              + "("+npm.version+")\n"
              + "'npm view <pkg> version' to view a package's "
              + "published version\n"
              + "'npm ls' to inspect current package/dependency versions"

function version (args, silent, cb_) {
  if (typeof cb_ !== "function") cb_ = silent, silent = false
  if (args.length > 1) return cb_(version.usage)
  pkgyaml.read(npm.localPrefix, function (er, data) {
    if (!args.length) {
      var v = {}
      Object.keys(process.versions).forEach(function (k) {
        v[k] = process.versions[k]
      })
      v.npm = npm.version
      if (data && data.name && data.version) {
        v[data.name] = data.version
      }
      if (npm.config.get("json")) {
        v = JSON.stringify(v, null, 2)
      }
      console.log(v)
      return cb_()
    }

    if (er) {
      log.error("version", "No package.json found")
      return cb_(er)
    }

    var newVer = semver.valid(args[0])

    // adding "micro" as an alias for patch, because "patch" is ambiguous
    // see https://github.com/mojombo/semver/issues/160
    if (args[0] === 'micro') args[0] = 'patch'

    if (!newVer) newVer = semver.inc(data.version, args[0])
    if (!newVer) return cb_(version.usage)
    if (data.version === newVer) return cb_(new Error("Version not changed"))
    data.version = newVer

    fs.readFile(path.join(npm.localPrefix, "npm-shrinkwrap.json"), function (er, _data) {
      if (er && er.code === "ENOENT") return doGit(data, silent, cb_)

      var shrinkwrapData
      try {
        shrinkwrapData = JSON.parse(_data.toString())
      }
      catch (er) {
        log.error("version", "Bad npm-shrinkwrap.json data")
        return cb_(er)
      }

      shrinkwrapData.version = data.version
      write(shrinkwrapData, "npm-shrinkwrap.json", function (er) {
        if (er) {
          log.error("version", "Bad npm-shrinkwrap.json data")
          return cb_(er)
        }
        doGit(data, silent, cb_)
      })
    })
  })
}

function doGit (data, silent, cb_) {
  fs.stat(path.join(npm.localPrefix, ".git"), function (er, s) {
    function cb (er) {
      if (!er && !silent) console.log("v" + data.version)
      cb_(er)
    }

    var doGit = !er && s.isDirectory() && npm.config.get("git-tag-version")
    if (!doGit) return write(data, cb)

    checkGit(data, cb)
  })
}

function checkGit (data, cb) {
  var args = [ "status", "--porcelain" ]
  var options = {env: process.env}

  // check for git
  git.whichAndExec(args, options, function (er, stdout) {
    if (er && er.code === "ENOGIT") {
      log.warn(
        "version",
        "This is a Git checkout, but the git command was not found.",
        "npm could not create a Git tag for this release!"
      )
      return write(data, cb)
    }

    var lines = stdout.trim().split("\n").filter(function (line) {
      if (line.match(/^\?\? /)) return false
      if (line.match(/^.  /)) return false
      return !!line.trim()
    })
    if (lines.length) return cb(new Error(
      "Git working directory not clean.\n"+lines.join("\n")
    ))
    write(data, function (er) {
      if (er) return cb(er)

      fs.stat("npm-shrinkwrap.json", function (er) {
        var shrinkwrap = !er
        var message = npm.config.get("message").replace(/%s/g, data.version)
          , sign = npm.config.get("sign-git-tag")
          , flag = sign ? "-sm" : "-am"
        pkgyaml.stat(npm.localPrefix, function(er, stat) {
          if (er) return cb(er)
          chain
            ( [ git.chainableExec([ "add", stat.file ], {env: process.env})
              , shrinkwrap && git.chainableExec([ "add", "npm-shrinkwrap.json" ]
                , {env: process.env})
              , git.chainableExec([ "commit", "-m", message ], {env: process.env})
              , sign && function (cb) {
                  npm.spinner.stop()
                  cb()
                }

              , git.chainableExec([ "tag", "v" + data.version, flag, message ]
                , {env: process.env}) ]
            , cb )
         })
      })
    })
  })
}

function write (data, file, cb) {
  if (typeof (file) === "function") {
    cb = file
    return pkgyaml.write(npm.localPrefix, data, cb)
  }
  writeFileAtomic( path.join(npm.localPrefix, file)
              , new Buffer(JSON.stringify(data, null, 2) + "\n")
              , cb )
}
