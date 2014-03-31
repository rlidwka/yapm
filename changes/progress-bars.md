Displaying download progress
----------------------------

`yapm` displays progress info on the last line on the terminal.

This is an experimental option. You can turn it on using `yapm set progress true`. Please leave a feedback on this if you can.

```sh
$ yapm install express --progress=true
  http - GET https://registry.npmjs.org/express
  http - 304 https://registry.npmjs.org/express
  http - GET https://registry.npmjs.org/connect/2.14.1
[... skip ...]
  http - GET https://registry.npmjs.org/mime
  http - GET https://registry.npmjs.org/keypress
 552 kB/s [29/50] [mime: 22.9 kB/25.5 kB] [keypress: 8.0 kB/22.0 kB]

# ^^^^^^^  ^^^^^   ^-- packages currently being downloaded
#        `      `----- completed / total http requests
#         `----------- your download speed
```

It displays three things:

1. Your download speed. Unfortunately, upload speed isn't measured yet, and it also doesn't include headers.
2. Amount of completed / total http requests. Unfortunately, yapm doesn't know how much requests it has to do beforehand, so total amount of requests will grow over time.
3. Packages currently being downloaded. This indicator came from `apt-get` program. If yapm downloads a lot of things at once, it'll be cut so it always fits on one terminal line.

Expect it to be on by default in the future, but it's still unclear when the future will finally come.

