"yapm" is a package manager for node.js (npm fork)

<p align="center"><img src=""></p>

## Changes

  - improvements in package.json handling
    - preserve formatting of package.json files
    - support for package.json5 and package.yaml files ([see details](https://github.com/rlidwka/yapm/blob/master/changes/package-yaml.md)).
    - if package.json or any other json document is malformed, show where the error is
    - configurable semver operator https://github.com/rlidwka/yapm/commit/62a97cd293f00d0317f1912aeed9914f682d8378

  - formatting changes
    - logs have much more clean formatting
    - added a progress bar showing download progress
    - better search output with github repository links

  - multiple registries support
    - registry-specific configs + security fixes
    - easier switch between different npm registries

  - semver support for packages installable from github

  - a bunch of other minor changes ([see details](https://github.com/rlidwka/yapm/blob/master/changes/minor-fixes.md)).

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

## Upstreams

### Pulled from [visionmedia/npm](https://github.com/visionmedia/npm)

  - Github semver support
  - Output formatting changes
  - Better search output

### Pulled from [npm/npm](https://github.com/npm/npm)

  - Everything else, this repository is synced with upstream at least once a week

