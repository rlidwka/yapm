A list of minor and non-essential differences from npm
======================================================

## git logging raised to http level

By default npm doesn't show what git urls it's trying to install. In yapm this message is displayed at http level, so it will be shown to users by default.

```
$ yapm install git+https://github.com/visionmedia/commander.js.git

  http - git https://github.com/visionmedia/commander.js.git#master

commander@2.1.0 node_modules/commander
```

## "micro" as an alias for "patch" in semver

Now you can do `yapm version micro` to increment third number.

For the reasons for this see discussion named ['"PATCH" might be ambiguous'](https://github.com/mojombo/semver/issues/160) in semver repo.

