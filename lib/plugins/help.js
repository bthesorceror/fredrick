'use strict';

module.exports = {
  command: 'help',
  hidden: true,
  func(fredrick, args) {
    fredrick.write('Help:');

    fredrick.write();
    fredrick.write(`'${fredrick.name} list' lists all available commands.`);
    fredrick.write(`'${fredrick.name} usage <command>' shows usage for a command.`);
    fredrick.write();

    fredrick.exit(0);
  }
}

