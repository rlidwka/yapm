
This module tries to update an existing yaml data preserving its structure (comments, linebreaks, etc.).

It's very hard to reliably update a part of yaml document. But it doesn't mean we shouldn't try.

## Usage

```javascript
var edit = require('yaml-update').edit;

// result will be something like "# comment\ntest1: 123\n\ntest2: 456\n"
edit("# comment\ntest1: 123\n\ntest2: 123\n", {test1: 123, test2: 456});
```

## Limitations

Currently it changes only top-level objects. If you try to change something deep inside the document (like key1.key2.key3.something = 123), this module will rewrite key1 with all comments and data inside with the new data.

To ensure that it didn't change anything unintended, it compares resulting yaml data with the intended data and throws if it don't match.

## Disclaimer

This module is written to solve one very specific task. It is not guaranteed to work everywhere.

It's very hard to reliably update a part of yaml document. If you know a good existing solution to do that please let me know.

