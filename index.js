'use strict';

const minimist = require('minimist');

class Fredrick {
  constructor(name, options) {
    options         = options || {};
    this.name       = name;
    this.stdout     = options.stdout || process.stdout;
    this.stderr     = options.stderr || process.stderr;
    this.exit       = options.exit || process.exit.bind(process);
    this.plugins    = [];
    this.extensions = [];

    this.addPlugin(require('./lib/plugins/help'));
    this.addPlugin(require('./lib/plugins/list'));
    this.addPlugin(require('./lib/plugins/usage'));
  }

  write(str) {
    if (!str) {
      return this.stdout.write('\n');
    }

    this.stdout.write(`${str}\n`);
  }

  error(str) {
    if (!str) {
      return this.stderr.write('\n');
    }

    this.stderr.write(`${str}\n`);
  }

  respond(args) {
    let command = args[0];
    let plugin  = this.findPlugin(command);

    if (!plugin) return;

    var options  = minimist(args.slice(1));
    var args     = options._;

    if (args[0] &&
        plugin.subcommands &&
        plugin.subcommands[args[0]]) {
      return plugin.subcommands[args[0]](this, args.slice(1), options);
    }

    plugin.func(this, args, options);
  }

  findPlugin(command) {
    return this.plugins.find((plugin) => {
      return plugin.command === command;
    });
  }

  checkForExtensions(object, type) {
    if (object.extensions && object.extensions.length) {
      object.extensions.forEach((name) => {
        if (!this.hasExtension(name))
          throw new Error(`${type} requires extension named ${name}`);
      });
    }
  }

  addPlugin(plugin) {
    this.checkForExtensions(plugin, 'Plugin');
    this.plugins.push(plugin);
  }

  hasExtension(name) {
    return !!this[name];
  }

  addExtension(extension) {
    if (this.hasExtension(extension.name))
      throw new Error('Extension name already taken');
    this.checkForExtensions(extension, 'Extension');
    this[extension.name] = extension.func;
  }
}

module.exports = Fredrick;
