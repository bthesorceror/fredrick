'use strict';

module.exports = {
  command: 'list',
  hidden: true,
  func(fredrick, args) {
    fredrick.write('List:');
    fredrick.write();

    fredrick.plugins.forEach((plugin) => {
      if (plugin.hidden) return;

      fredrick.write(plugin.command);
      fredrick.write(`  ${plugin.description}`);
    });

    fredrick.write();

    fredrick.exit(0);
  }
}
