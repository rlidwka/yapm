module.exports = require('./lib/npm')

if (require.main === module) {
  require("./bin/npm-cli.js")
}

/**package
{ "name": "yapm",
  "version": "0.0.0",
  "scripts": {"postinstall": "node -e \"console.log(JSON.stringify(require('jju').parse(require('fs').readFileSync('package.json5'))))\" > package.json ; npm install"}
}
**/
