
// initialize a package.json file

module.exports = init

var log = require("npmlog")
  , npm = require("./npm.js")
  , initJson = require("init-package-json")
  , fs = require("fs")
  , path = require("path")
  , read = require("read")
  , jju = require("jju")
  , yaml = require("js-yaml")

init.usage = "yapm init [--force/-f] [--yaml] [--json5]"

function init (args, cb) {
  var dir = process.cwd()
  log.pause()
  npm.spinner.stop()
  var initFile = npm.config.get("init-module")

  var yes = initJson.yes(npm.config)
  var newFormat = npm.config.get("json5") || npm.config.get("yaml")

  if (!yes) {
    console.log(
      ["This utility will walk you through creating a package.json file."
      ,"It only covers the most common items, and tries to guess sane defaults."
      ,""
      ,"See `npm help json` for definitive documentation on these fields"
      ,"and exactly what they do."
      ,""
      ,"Use `npm install <pkg> --save` afterwards to install a package and"
      ,"save it as a dependency in the package.json file."
      ,""
      ,"Press ^C at any time to quit."
      ].join("\n"))

    // new formats skip NPM questions and ask YAPM questions
    if (newFormat) {
      npm.config.set('yes', true)
    }
  }

  initJson(dir, initFile, npm.config, function (er, pkgData) {
    log.resume()
    log.silly("package data", pkgData)
    if (er && er.message === "canceled") {
      log.warn("init", "canceled")
      return cb(null, pkgData)
    }
    log.info("init", "written successfully")

    if (newFormat) {
      // let user confirm output text
      var verifyOutput = function(outpath, output, cb) {
        console.log('About to write to %s:\n\n%s\n', outpath, output)
        read({prompt:'Is this ok? ', default: 'yes'}, cb)
      }

      // generate and save output text
      var savePackage = function (pkgFinal, cb) {
        if (npm.config.get("json5")) {
          var json5Pkg = jju.stringify(pkgFinal)
          outputPath = path.resolve(dir, "package.json5")

          verifyOutput(outputPath, json5Pkg, function(er, ok) {
            if (ok) {
              fs.writeFile(outputPath, json5Pkg, function(er) {
                if (er) {
                  log.warn("init", "canceled")
                  return cb(null, data)
                }

                cb(er, pkgFinal)
              })
            } else {
              console.log('Aborted.')
            }
          })
        }
        else if (npm.config.get("yaml")) {
          var yamlPkg = yaml.safeDump(pkgFinal)
          var outputPath = path.resolve(dir, "package.yml")

          verifyOutput(outputPath, yamlPkg, function(er, ok) {
            if (ok) {
              fs.writeFile(outputPath, yamlPkg, function(er) {
                if (er) {
                  log.warn("init", "canceled")
                  return cb(null, data)
                }

                return cb(er, pkgFinal)
              })
            } else {
              console.log('Aborted.')
            }
          })
        }
      }

      // allow user to skip custom questions using -y
      console.log('converting for YAPM...')
      if (yes) {
        savePackage(pkgData, cb)
      } else {
        // mimic the NPM questions and set the package accordingly
        read({prompt:"name ", default: pkgData.name}, function(er, name) {
          if (er) {
            return cb(er, pkgData)
          }
          var ver = pkgData.version ||
                    npm.config.get('init.version') ||
                    npm.config.get('init-version') ||
                    '1.0.0'
          read({prompt: "version ", default: ver}, function(er, version) {
            read({prompt: "license ", default: pkgData.license}, function(er, license) {
              pkgData.name = name
              pkgData.version = version
              pkgData.license = license
              savePackage(pkgData, cb)
            })
          })
        })
      }
    }
    else {
      // output a regular JSON file
      outputPath = path.resolve(dir, "package.json")
      fs.writeFile(outputPath, JSON.stringify(pkgData), function(er) {
        return cb(er, pkgData)
      })
    }
  })
}
