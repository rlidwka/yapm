Configurable semver range operator
----------------------------------

If you use `--save` option, package manager would save an installed package to a package.json file.

By default it uses `^` operator. Unfortunately, it isn't backward compatible (node 0.8 and earlier 0.10 versions don't understand it), and also isn't always desirable.

In `yapm` you can configure it.

You can return old npm behaviour in config:
yapm config set save-range '~'
yapm install --save express

Or just use range shortcut in the command line:
yapm install --save --range='~' express

Available options for save-range are:
 - "~"
 - "^"
 - ">="
 - "<="
 - "=" - no range (exact)

This is an implementation of the suggestion in [npm/npm#4713](https://github.com/npm/npm/issues/4713).

