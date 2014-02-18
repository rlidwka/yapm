"yapm" is a package manager for node.js (npm fork)

## Changes

### Our own changes

  - full support for package.json5 and package.yaml file formats ([docs](https://github.com/rlidwka/yapm/blob/master/changes/package-yaml.md), [#3869](https://github.com/npm/npm/issues/3869)).
  - if package.json or any other json document is malformed, we show exactly where the error is ([docs](https://github.com/rlidwka/yapm/blob/master/changes/json-errors.md), [#3336](https://github.com/isaacs/npm/issues/3336), [#4482](https://github.com/npm/npm/issues/4482)).
  - a bunch of other minor changes ([docs](https://github.com/rlidwka/yapm/blob/master/changes/minor-fixes.md)).

### Pulled from [visionmedia/npm](https://github.com/visionmedia/npm)

  - adds support for public & private __semver-friendly github tarballs__
  - __output formatting__ changes
  - better __search output__ with github repository links that you can cmd+click to view
  - remove some __error reporting__ that is only useful to people debugging npm
  - remove annoying __readme__ and __repository__ field warnings

### Pulled from [npm/npm](https://github.com/npm/npm)

  - Everything else, this repository is synced with upstream at least once a week

## Installation

```sh
# install it as a global module (maybe with sudo)
$ npm install -g yapm

# run it just as you'd run npm itself
$ yapm install whatever

# if you want to write 'npm' and hate the name change,
# you might want to use an alias (i.e. write into ~/.bashrc)
$ alias npm=yapm
```

