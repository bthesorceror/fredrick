'use strict';

module.exports = {
  command: 'usage',
  hidden: true,
  func(fredrick, args) {
    if (args.length < 1) {
      fredrick.write(`${fredrick.name} usage <command>`);
      return fredrick.exit(1);
    }

    var plugin = fredrick.findPlugin(args[0]);

    if (!plugin) {
      fredrick.write('Invalid command');
      return fredrick.exit(1);
    }

    fredrick.write('Usage:');

    if (plugin.usage)
      fredrick.write(plugin.usage);
    else
      fredrick.write('No usage defined');

    fredrick.exit(0);
  }
}

