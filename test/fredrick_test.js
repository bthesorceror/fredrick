var test     = require('tape');
var Fredrick = require('../index');
var sinon    = require('sinon');

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
