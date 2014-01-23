
# npm

  Personal fork of npm with the following changes:

  - adds support for public & private __semver-friendly github tarballs__
  - __output formatting__ changes as shown below
  - better __search output__ with github repository links that you can cmd+click to view
  - remove some __error reporting__ that is only useful to people debugging npm
  - remove annoying __readme__ and __repository__ field warnings

## Installation

```
$ npm install -g visionmedia/npm
```

## Output

  Subjectively cleaner output:

  ![](https://dl.dropboxusercontent.com/u/6396913/misc/Screen%20Shot%202014-01-16%20at%206.28.52%20PM.png)

## Search

  Search output with useful github urls, no npmjs.org indirection, use cmd+dblclick
  to open in the browser.

  ![](https://dl.dropboxusercontent.com/u/6396913/misc/Screen%20Shot%202014-01-17%20at%204.25.36%20AM.png)

## GitHub semver

  If you've ever tried using private github repositories instead of a private npm registry,
  you've probably failed. This fork of npm adds semver support for exactly that.

  For example the following [component](https://github.com/component/component)-style dependency definitions allow you to specify
  the username/repository, as well as the version - this is true for both public and
  private repos.

```json
"dependencies": {
  "visionmedia/debug": "~0.7.0",
  "visionmedia/private": "1.x"
}
```

For authentiation you need to create an access token:

  ![](https://dl.dropboxusercontent.com/u/6396913/misc/Screen%20Shot%202014-01-22%20at%207.58.55%20PM.png)

Then run:

```
$ npm config set github_token <token>
```

# License

  Whatever npm is + MIT