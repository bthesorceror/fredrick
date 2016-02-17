# Fredrick

[![Build Status](https://travis-ci.org/bthesorceror/fredrick.svg?branch=master)](https://travis-ci.org/bthesorceror/fredrick)

simple module for writing your spiffy command line tools

## Example

```javascript
'use strict';

const Fredrick = require('fredrick');

let fredrick = new Fredrick('fredrick');

fredrick.addExtension({
  name: 'test1',
  func: function() {}
});

fredrick.addExtension({
  name: 'test2',
  extensions: ['test1'],
  func: function() {
    this.test1();
  }
});

fredrick.addPlugin({
  command: 'test',
  usage: 'fredrick test [--prod] [--error]',
  description: 'a test command',
  extensions: ['test2'],
  func(fredrick, args, options) {
    if (options.prod) {
      fredrick.write('PRODUCTION!');
    }

    if (options.error) {
      fredrick.error('MY BAD!');
    }

    fredrick.test2();

    fredrick.write('TESTING');
    fredrick.exit(0);
  },
  subcommands: {
    list(fredrick, args, options) {
      fredrick.write('LISTING');
      fredrick.exit(0);
    }
  }
});

fredrick.respond(process.argv.slice(2));
```
