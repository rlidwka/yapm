**WARNING: this is pre-release, wait a few days**

There is a couple of quite annoying bugs to be fixed.

## What is it?

This is npm wrapper allowing to use `package.yaml` instead of `package.json`. It converts `package.yaml` to `package.json` and back on the fly.

## How?

It performs active MitM attack (so to speak) between *node* and *npm*.

Technically speaking, it monkey-patches standard library, so *npm* **thinks** it is working with `package.json`, and *node* **thinks** that *npm* is working with `package.yaml`. And this module act as a middleman and converts this thing back and forth on the fly. Pretty nice little hack, huh?

1. If *npm* asks filesystem to READ a file named `package.json` **AND** if there is no such file **AND** there is a file named `package.yaml`, we compile it and return resulting json to *npm* pretending that we just read what we was asked for.

2. If *npm* asks filesystem to WRITE a file named `package.json` **AND** if this file doesn't exist already, we write it to a file named `package.yaml` instead. This option is designed specifically for *npm init* command.

## Why not just use JSON?


## Why YAML?

When I started thinking about this in 2012, I didn't know what it is. I was thinking about other things...

Besides, cool Ruby guys use it and ain't complaining very much. ;)

## Discussions in node.js mailing lists

1. "comments in package.json" ([1](https://groups.google.com/forum/?fromgroups#!topic/nodejs/NmL7jdeuw0M), [2](http://markmail.org/message/prat4277mnz56mgt))

