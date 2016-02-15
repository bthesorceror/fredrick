# Fredrick

simple module for writing your spiffy command line tools

## Example

```javascript
'use strict';

const Fredrick = require('fredrick');

let fredrick = new Fredrick('fredrick');

fredrick.addPlugin({
  command: 'test',
  usage: 'fredrick test [--prod]',
  description: 'a test command',
  func(fredrick, args, options) {
    if (options.prod) {
      fredrick.write('PRODUCTION!');
    }
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
