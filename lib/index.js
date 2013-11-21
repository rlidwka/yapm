
// overwriting fs.readFile[Sync]
require('./read-yaml')

// overwriting fs.writeFile[Sync]
require('./write-yaml')

// overwriting fs.readdir[Sync]
require('./readdir-yaml')

// overwriting fs.createWriteStream, fs.lstat
// probably should be after read-yaml
require('./streams')

// overwriting child_process.execFile
// for 'git add package.json' executed by 'npm version'
require('./exec-git')

