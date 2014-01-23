
# npm

  Personal fork of npm with the following changes:

  - adds support for public & private __semver-friendly github tarballs__
  - __output formatting__ changes as shown below
  - better __search output__ with github repository links that you can cmd+click to view
  - remove some __error reporting__ that is only useful to people debugging npm
  - remove annoying __readme__ and __repository__ field warnings

## Output

  Subjectively cleaner output:

  ![](https://dl.dropboxusercontent.com/u/6396913/misc/Screen%20Shot%202014-01-16%20at%206.28.52%20PM.png)

## Search

  Search output with useful github urls, no npmjs.org indirection, use cmd+dblclick
  to open in the browser.

  ![](https://dl.dropboxusercontent.com/u/6396913/misc/Screen%20Shot%202014-01-17%20at%204.25.36%20AM.png)