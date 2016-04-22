'use strict';

const minimist = require('minimist');

class Fredrick {
  constructor(name, options) {
    options   = options || {};
    this.name = name;

    this.stdout = options.stdout || process.stdout;
    this.stderr = options.stderr || process.stderr;
    this.stdin  = options.stdin  || process.stdin;
    this.exit   = options.exit   || process.exit.bind(process);

    this.plugins    = [];
    this.extensions = [];
    this.properties = [];

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

    if (!plugin) {
      this.error('Invalid command');
      return this.exit(1);
    }

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

  checkForProperties(object, type) {
    if (!object.properties || !object.properties.length) return;

    object.properties.forEach((name) => {
      if (this.hasProperty(name)) return;

      throw new Error(`${type} requires property named ${name}`);
    });
  }

  addPlugin(plugin) {
    if (!plugin.command)
      throw new Error('Plugins must have a command');

    if (this.findPlugin(plugin.command))
      throw new Error(`'${plugin.command}' command is already used`);

    this.checkForExtensions(plugin, 'Plugin');
    this.checkForProperties(plugin, 'Plugin');
    
    this.plugins.push(plugin);
  }

  hasExtension(name) {
    return !!this.extensions.find((value) => {
      return name === value;
    });
  }

  hasProperty(name) {
    return !!this.properties.find((value) => {
      return name === value;
    });
  }

  addExtension(extension) {
    if (this.hasExtension(extension.name))
      throw new Error('Extension name already taken');
    this.checkForExtensions(extension, 'Extension');
    this.checkForProperties(extension, 'Extension');

    this.extensions.push(extension.name);
    this[extension.name] = extension.func;
  }

  addProperty(property) {
    if (this.hasProperty(property.name))
      throw new Error('Property name already taken');
    if (this.hasExtension(property.name))
      throw new Error('Property name already taken by an extension');

    this.checkForExtensions(property, 'Property');
    this.checkForProperties(property, 'Property');

    this.properties.push(property.name);
    let getter = function() { return property.value };

    if (property.value instanceof Function) {
      getter = property.value;
    }

    Object.defineProperty(this, property.name, { get: getter });
  }
}

module.exports = Fredrick;
