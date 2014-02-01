Semver support for GitHub packages
==================================

This change adds support for public & private semver-friendly github tarballs.

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

