'use strict';

const help = {
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

const list = {
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

const usage = {
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

class Fredrick {
  constructor(name, options) {
    options      = options || {};
    this.name    = name;
    this.stdout  = options.stdout || process.stdout;
    this.exit    = options.exit || process.exit.bind(process);
    this.plugins = [];

    this.addPlugin(help);
    this.addPlugin(list);
    this.addPlugin(usage);
  }

  write(str) {
    if (!str) {
      return this.stdout.write('\n');
    }

    this.stdout.write(`${str}\n`);
  }

  respond(args) {
    let command = args[0];
    let plugin  = this.findPlugin(command);

    if (!plugin) return;

    args = args.slice(1);
    plugin.func(this, args);
  }

  findPlugin(command) {
    return this.plugins.find((plugin) => {
      return plugin.command === command;
    });
  }

  addPlugin(plugin) { this.plugins.push(plugin); }
}

module.exports = Fredrick;
