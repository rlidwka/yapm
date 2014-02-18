Display presize location of errors in JSON documents
----------------------------------------------------

Sometimes you have an invalid `package.json`. It might be a simple typo, it might be a filesystem issue, or something else.

### Use-case example

```js
$ echo '{ "name": "test", some garbage' > package.json
$ npm install whatever
npm ERR! install Couldn't read dependencies
npm ERR! Failed to parse json
npm ERR! Unexpected token s
npm ERR! File: /tmp/package.json
npm ERR! Failed to parse package.json data.
npm ERR! package.json must be actual JSON, not just JavaScript.
```

This isn't helpful.

```js
$ echo '{ "name": "test", some garbage' > package.json
$ yapm install whatever
 error - Failed to parse json
         Unexpected token 's' at 1:19
         { "name": "test", some garbage
                           ^
 error - File: /tmp/package.json
 error - Failed to parse package.json data.
         package.json must be actual JSON, not just JavaScript.
```

This is, because you see that it is not JSON, and you see an exact position of the error, it happened in line 1 column 19.

Same thing happens whenever `JSON.parse()` is called. So if you receiving non-json data from npm registry, you'll also clearly see where the error is. Look at the [issue #4449](https://github.com/npm/npm/issues/4449). Can you spot where that big ugly JSON fails to parse? With this patch it will be easy.

### Discussions

1. "have npm report the error with a package.json" - [github issue](https://github.com/npm/npm/issues/3869)
2. "make JSON.parse return error positions" - [github PR](https://github.com/npm/npm/pull/4373)

