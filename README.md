"yapm" is a package manager for node.js (npm fork)

## Changes

### Our own changes

  - full support for package.json5 and package.yaml file formats
  - if package.json or any other json document is malformed, we show exactly where the error is

### Pulled from https://github.com/visionmedia/npm

  - adds support for public & private __semver-friendly github tarballs__
  - __output formatting__ changes
  - better __search output__ with github repository links that you can cmd+click to view
  - remove some __error reporting__ that is only useful to people debugging npm
  - remove annoying __readme__ and __repository__ field warnings

### Pulled from https://github.com/npm/npm

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

