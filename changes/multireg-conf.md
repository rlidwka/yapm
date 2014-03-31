Registry-specific configuraion
------------------------------

With `yapm` you can use different npm registries at the same time without changing your config file.

This change still does not allow you to combine packages from different registries.

### config

This is how typical configuration looks like:

```
[registries."https://registry.npmjs.org/"]
_auth = (your auth string for public registry)
email = john-doe@example.org
ca = null

[registries."http://localhost:4873/"]
_auth = (your auth string for private registry)
always-auth = true
email = john@company.com
```

It is compatible with npm, and you can override each config option for different registries.

By default yapm saves `_auth` data under its respective registry, so yapm won't expose your passwords to a malicious 3rd party registry by mistake. See [here](multireg-sec.md) for details.

### publishConfig

This feature is long known in npm, but with yapm it's more useful. We recommend to use `publishConfig` to specify registry for each package:

```
publishConfig: {
  "registry": "https://registry.npmjs.org/"
}
```

If you do that, you can easily publish private and public packages to different places:

```sh
/tmp$ cd private-pkg
/tmp/private-pkg$ yapm publish
  http - PUT http://localhost:4873/private-pkg
  http - 201 http://localhost:4873/private-pkg
+ private-pkg@0.1.0

/tmp/private-pkg$ cd ../public
/tmp/public-pkg$ yapm publish
  http - PUT https://registry.npmjs.org/public-pkg
  http - 201 https://registry.npmjs.org/public-pkg
+ public-pkg@0.1.0
```

You can have different passwords and auth data for your private and public registry, and you don't have to change configuration.

