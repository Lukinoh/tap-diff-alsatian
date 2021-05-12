# tap-diff-alsatian

[![npm version](https://badge.fury.io/js/tap-diff-alsatian.svg)](http://badge.fury.io/js/tap-diff-alsatian)

The most human-friendly [TAP reporter](https://github.com/substack/tape#pretty-reporters).

![Screenshot](screenshot1.png)

![Screenshot](screenshot2.png)

## Info

This package is an updated version of tap-diff with:
 - Dependencies update
 - Support of last release version of alsatian (3.2.1).

## How to use

```
npm install tap-diff-alsatian
```

```
alsatian './**/*.spec.ts' --tap | tap-diff-alsatian
```

Or use with `createStream()`:

```javascript
'use strict'

const test = require('tape')
const tapDiff = require('tap-diff-alsatian')

test.createStream()
  .pipe(tapDiff())
  .pipe(process.stdout)

test('timing test', (t) => {
  t.plan(2)
  t.equal(typeof Date.now, 'function')
  var start = Date.now()

  setTimeout(() => {
    t.equal(Date.now() - start, 100)
  }, 100)
})
```

## License

MIT
