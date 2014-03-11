A list of minor and differences from npm
----------------------------------------

### "prune" does not remove bundleDependencies

If a certain dependency is specified as a bundled dependency and isn't mentioned anywhere else, `npm prune` will delete it, but `yapm prune` will not.

See discussion in [npm/npm#4573](https://github.com/npm/npm/issues/4573) and [pull request](https://github.com/npm/read-installed/pull/18) against npm.

### git logging raised to http level

By default npm doesn't show what git urls it's trying to install. In yapm this message is displayed at http level, so it will be shown to users by default.

```
$ yapm install git+https://github.com/visionmedia/commander.js.git

  http - git https://github.com/visionmedia/commander.js.git#master

commander@2.1.0 node_modules/commander
```

### "micro" as an alias for "patch" in semver

Now you can do `yapm version micro` to increment third number.

For the reasons for this see discussion named ['"PATCH" might be ambiguous'](https://github.com/mojombo/semver/issues/160) in semver repo.

