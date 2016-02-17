var test     = require('tape');
var Fredrick = require('../index');
var sinon    = require('sinon');

test('Fredrick has the ability to be extended', function(t) {

  t.test('adds method', function(t) {

    t.plan(2);

    var fredrick = new Fredrick('fredrick');

    function func() {
      t.equal(this, fredrick, 'keeps context');
    }

    var extension = {
      name: 'helper',
      func: func
    };

    fredrick.addExtension(extension);

    fredrick.addPlugin({
      command: 'command',
      func: function(fredrick, args, options) {
        t.equal(fredrick.helper, func, 'adds method');
        fredrick.helper();
      }
    });

    fredrick.respond(['command']);

  });

  t.test('with extensions name taken', function(t) {

    t.plan(1);

    var fredrick = new Fredrick('fredrick');

    function func() {}

    var extension = {
      name: 'helper',
      func: func
    };

    fredrick.addExtension(extension);

    try {
      fredrick.addExtension(extension);
    } catch(ex) {
      t.ok(true, 'throws error');
    }

  });

  t.test('with plugin requiring extension', function(t) {

    t.test('extension loaded', function(t) {
      t.plan(2);

      var fredrick = new Fredrick('fredrick');

      function func() {
        t.equal(this, fredrick, 'keeps context');
      }

      var extension = {
        name: 'helper',
        func: func
      };

      fredrick.addExtension(extension);

      fredrick.addPlugin({
        command: 'command',
        extensions: ['helper'],
        func: function(fredrick, args, options) {
          t.equal(fredrick.helper, func, 'adds method');
          fredrick.helper();
        }
      });

      fredrick.respond(['command']);
    });

    t.test('extension not loaded', function(t) {
      t.plan(1);

      var fredrick = new Fredrick('fredrick');

      try {
        fredrick.addPlugin({
          command: 'command',
          extensions: ['helper'],
          func: function(fredrick, args, options) {}
        });
        t.ok(false, 'should not reach');
      } catch(ex) {
        t.ok(true, 'throws error');
      }
    });

  });

  t.test('with extension requiring extension', function(t) {
    t.plan(1);

    var fredrick = new Fredrick('fredrick');

    var extension = {
      name: 'helper',
      extensions: ['tester'],
      func: function(){}
    };

    try {
      fredrick.addExtension(extension);
      t.ok(false, 'should not reach');
    } catch(ex) {
      t.ok(true, 'throws error');
    }
  });

});

test('Fredrick allows errors', function(t) {
  t.plan(1);
  var fakeStderr = { write: sinon.spy() };

  var fredrick = new Fredrick('fredrick', { stderr: fakeStderr });

  fredrick.error('testing');

  t.ok(
    fakeStderr.write.calledWith('testing\n'),
    'writes out to stderr');
});

test('Fredrick allows options', function(t) {

    t.plan(3);

    var fakeStdout = { write: sinon.spy() };
    var fakeExit   = sinon.spy();

    var fredrick = new Fredrick('fredrick', {
      stdout: fakeStdout, exit: fakeExit
    });

    function func(fredrick, args, options) {
      t.ok(true, 'calls func');
      t.deepEqual(
        args,
        ['list'],
        'does not removes the subcommand from args');

      t.equal(
        options.prod,
        true,
        'receives prod as option');
      return;
    }

    fredrick.addPlugin({
      command: 'test1',
      func: func,
      description: 'description 1',
      usage: 'usage 1',
      subcommands: {
      }
    });

    var args = ['test1', 'list', '--prod'];

    fredrick.respond(args);

});

test('Fredrick allows for subcommands', function(t) {

  t.test('with valid subcommand', function(t) {

    t.plan(2);

    var fakeStdout = { write: sinon.spy() };
    var fakeExit   = sinon.spy();

    var fredrick = new Fredrick('fredrick', {
      stdout: fakeStdout, exit: fakeExit
    });

    function noop() { };

    function list(fredrick, args) {
      t.ok(true, 'calls subcommand');
      t.deepEqual(args, [], 'removes the subcommand from args');
      return;
    }

    fredrick.addPlugin({
      command: 'test1',
      func: noop,
      description: 'description 1',
      usage: 'usage 1',
      subcommands: {
        list: list
      }
    });

    var args = ['test1', 'list'];

    fredrick.respond(args);

  });

  t.test('with invalid subcommand', function(t) {

    t.plan(2);

    var fakeStdout = { write: sinon.spy() };
    var fakeExit   = sinon.spy();

    var fredrick = new Fredrick('fredrick', {
      stdout: fakeStdout, exit: fakeExit
    });

    function func(fredrick, args, options) {
      t.ok(true, 'calls func');
      t.deepEqual(
        args,
        ['list'],
        'does not removes the subcommand from args');
      return;
    }

    fredrick.addPlugin({
      command: 'test1',
      func: func,
      description: 'description 1',
      usage: 'usage 1',
      subcommands: {
      }
    });

    var args = ['test1', 'list'];

    fredrick.respond(args);

  });

});

test('Fredrick responds to help command', function(t) {

  var fakeStdout = { write: sinon.spy() };
  var fakeExit   = sinon.spy();

  var fredrick = new Fredrick('fredrick', {
    stdout: fakeStdout, exit: fakeExit
  });

  var args = ['help'];

  fredrick.respond(args);

  t.plan(4);
  t.ok(fakeStdout.write.calledWith('Help:\n'), 'writes header');

  t.ok(
    fakeStdout.write.calledWith("'fredrick list' lists all available commands.\n"),
    'writes help for list');

  t.ok(
    fakeStdout.write.calledWith("'fredrick usage <command>' shows usage for a command.\n"),
    'writes help for usage');

  t.ok(fakeExit.calledWith(0), 'exits cleanly');

});

test('Fredrick responds to usage command', function(t) {

  t.test('with no command', function(t) {

    var fakeStdout = { write: sinon.spy() };
    var fakeExit   = sinon.spy();

    var fredrick = new Fredrick('fredrick', {
      stdout: fakeStdout, exit: fakeExit
    });

    var args = ['usage'];

    fredrick.respond(args);

    t.plan(2);

    t.ok(
      fakeStdout.write.calledWith("fredrick usage <command>\n"),
      'write correct use of usage command');

    t.ok(fakeExit.calledWith(1), 'exits with error');

  });

  t.test('with invalid command', function(t) {

    var fakeStdout = { write: sinon.spy() };
    var fakeExit   = sinon.spy();

    var fredrick = new Fredrick('fredrick', {
      stdout: fakeStdout, exit: fakeExit
    });

    var args = ['usage', 'test1'];

    fredrick.respond(args);

    t.plan(2);

    t.ok(
      fakeStdout.write.calledWith("Invalid command\n"),
      'write for invalid command');

    t.ok(fakeExit.calledWith(1), 'exits with error');

  });

  t.test('with valid command', function(t) {

    var fakeStdout = { write: sinon.spy() };
    var fakeExit   = sinon.spy();

    var fredrick = new Fredrick('fredrick', {
      stdout: fakeStdout, exit: fakeExit
    });

    function noop(){};

    fredrick.addPlugin({
      command: 'test1',
      func: noop,
      description: 'description 1',
      usage: 'usage 1'
    });

    var args = ['usage', 'test1'];

    fredrick.respond(args);

    t.plan(3);

    t.ok(
      fakeStdout.write.calledWith("Usage:\n"),
      'write header');

    t.ok(
      fakeStdout.write.calledWith("usage 1\n"),
      'write command usage');

    t.ok(fakeExit.calledWith(0), 'exits cleanly');

  });

  t.test('with valid command without usage', function(t) {

    var fakeStdout = { write: sinon.spy() };
    var fakeExit   = sinon.spy();

    var fredrick = new Fredrick('fredrick', {
      stdout: fakeStdout, exit: fakeExit
    });

    function noop(){};

    fredrick.addPlugin({
      command: 'test1',
      func: noop,
      description: 'description 1'
    });

    var args = ['usage', 'test1'];

    fredrick.respond(args);

    t.plan(3);

    t.ok(
      fakeStdout.write.calledWith("Usage:\n"),
      'write header');

    t.ok(
      fakeStdout.write.calledWith("No usage defined\n"),
      'write command usage');

    t.ok(fakeExit.calledWith(0), 'exits cleanly');

  });

});

test('Fredrick responds to list command', function(t) {

  var fakeStdout = { write: sinon.spy() };
  var fakeExit   = sinon.spy();

  var fredrick = new Fredrick('fredrick', {
    stdout: fakeStdout, exit: fakeExit
  });

  var args = ['list'];

  function noop(){};

  fredrick.addPlugin({
    command: 'test1',
    func: noop,
    description: 'description 1'
  });

  fredrick.addPlugin({
    command: 'test2',
    func: noop,
    description: 'description 2'
  });

  fredrick.respond(args);

  t.plan(7);
  t.ok(fakeStdout.write.calledWith('List:\n'), 'writes header');

  t.ok(
    fakeStdout.write.calledWith('test1\n'),
    'writes test1 command'
  );

  t.ok(
    fakeStdout.write.calledWith('  description 1\n'),
    'writes test1 description'
  );

  t.ok(
    fakeStdout.write.calledWith('test2\n'),
    'writes test2 command'
  );

  t.ok(
    fakeStdout.write.calledWith('  description 2\n'),
    'writes test2 description'
  );

  t.notOk(
    fakeStdout.write.calledWith('help\n'),
    'does not write help command'
  );

  t.ok(fakeExit.calledWith(0), 'exits cleanly');

});
