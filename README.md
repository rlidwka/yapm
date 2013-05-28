
##

## How?

This module monkey-patches `fs.readFile` and `fs.writeFile` functions.

1. If *npm* asks filesystem to READ a file named `package.json` **AND** if there is no such file **AND** there is a file named `package.yaml`, we compile it and return resulting json to *npm* pretending that we just read what we was asked for.

2. If *npm* asks filesystem to WRITE a file named `package.json` **AND** if this file doesn't exist already, we write it to a file named `package.yaml` instead. This option is designed specifically for *npm init* command.

## Why not just use JSON?

JSON suck.

## Why YAML?

When I started thinking about this in 2012, I didn't know what it is. I was thinking about other things...

Besides, cool Ruby guys use it and ain't complaining very much. ;)

