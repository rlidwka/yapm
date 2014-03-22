"yapm" is a package manager for node.js (npm fork)

![screenshot](https://raw.github.com/rlidwka/yapm/master/changes/images/main.png)

## Changes

  - improvements in package.json handling:
    - preserve formatting of package.json files
    - support for package.json5 and package.yaml files ([docs](https://github.com/rlidwka/yapm/blob/master/changes/package-yaml.md), [#3336](https://github.com/isaacs/npm/issues/3336), [#4482](https://github.com/npm/npm/issues/4482)).
    - if package.json or any other json document is malformed, show where the error is ([#3869](https://github.com/npm/npm/issues/3869)).
    - configurable semver operator ([docs](https://github.com/rlidwka/yapm/blob/master/changes/semver-range.md), [#4587](https://github.com/npm/npm/issues/4587), [#4713](https://github.com/npm/npm/issues/4713)).

  - formatting changes:
    - logs have much more clean formatting
    - added a progress bar showing download progress ([#1257](https://github.com/npm/npm/issues/4587))
    - better search output with github repository links

  - multiple registries support
    - registry-specific configs + security fixes
    - easier switch between different npm registries

  - semver support for packages installable from github ([docs](https://github.com/rlidwka/yapm/blob/master/changes/github-semver.md), [#3014](https://github.com/npm/npm/issues/3014), [#3328](https://github.com/npm/npm/issues/3328), [#3442](https://github.com/npm/npm/issues/3442), [#3511](https://github.com/npm/npm/issues/3511), [#4527](https://github.com/npm/npm/issues/4527)).

  - a bunch of other minor changes ([docs](https://github.com/rlidwka/yapm/blob/master/changes/minor-fixes.md), [#4573](https://github.com/npm/npm/issues/4573)).

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

