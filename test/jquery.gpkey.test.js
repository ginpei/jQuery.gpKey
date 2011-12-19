var GpKey = com.ginpen.GpKey;
var g_$el, g_inst;

function build(type, commands, settings) {
  g_$el = $('<div />').gpKey(type, commands, settings);
  return g_inst = g_$el.data('gpkey');
}

// --------------

module('static');

test('global', function() {
  ok(com.ginpen.GpKey, 'com.ginpen.GpKey');
  var $el = $('<div />');
  equal($el.gpKey()[0], $el[0], 'jQuery.fn.gpKey');
});

test('add target', function() {
  var $el = $('<div />');
  var fn = function() {};
  var commands = { 'a': fn };
  var settings = {};
  GpKey.addTarget($el, 'down', commands, settings);

  var inst = $el.data('gpkey');
  ok(inst instanceof GpKey, 'instance');
  equal(inst.commands.down.a, fn, 'commands');
  equal(inst.settings, settings, 'settings');
  ok($el.hasClass('gpkey'), 'add class');
});

test('fix type name', function() {
  equal(GpKey._fixTypeName('press'), 'press', 'press');
  equal(GpKey._fixTypeName('keypress'), 'press', 'keypress');
  equal(GpKey._fixTypeName('down'), 'down', 'down');
  equal(GpKey._fixTypeName('keydown'), 'down', 'keydown');
  equal(GpKey._fixTypeName('up'), 'up', 'up');
  equal(GpKey._fixTypeName('keyup'), 'up', 'keyup');
  equal(GpKey._fixTypeName('click'), '', 'click');
});

test('find target', function() {
  var inst = {};
  var $el = $('<div />')
    .addClass('gpkey')
    .data('gpkey', inst);
  var $inside = $('<div />')
    .appendTo($el);

  equal(GpKey._findTarget($el), inst, 'find on ownself');
  equal(GpKey._findTarget($inside), inst, 'find from parents');
  equal(GpKey._findTarget($('<div />')), null, 'not found');
});

test('update target element', function() {
  var inst1 = {
    $el: $('<div />')
  };
  GpKey.updateCurTarget(inst1);
  ok(inst1.$el.hasClass('gpkey-current'), 'add class');
  equal(GpKey.getCurTarget(), inst1, 'store instance');

  var inst2 = {
    $el: $('<div />')
  };
  GpKey.updateCurTarget(inst2);
  ok(inst2.$el.hasClass('gpkey-current'), 'add class to another one');
  equal(GpKey.getCurTarget(), inst2, 'store new instance');
  ok(!inst1.$el.hasClass('gpkey-current'), 'remove class from last one');
});

test('fire', 2, function() {
  var event;
  var $el = $('<div />');

  GpKey._curTarget = build('down', {
    'a': function() {
      ok(true, '"a"');
      start();
    }
  });
  event = {
    altKey: false,
    ctrlKey: false,
    keyCode: 65,
    metaKey: false,
    shiftKey: false,
    type: 'keydown',
    preventDefault: $.noop
  };

  stop();
  GpKey._fire(event);

  GpKey._curTarget = build('up', {
    '^&A': function() {
      ok(true, '"^&A"');
      start();
    }
  });
  event = {
    altKey: true,
    ctrlKey: true,
    keyCode: 65,
    metaKey: false,
    shiftKey: true,
    type: 'keyup',
    preventDefault: $.noop
  };

  stop();
  GpKey._fire(event);

  GpKey._curTarget = null;
});

test('get command', function() {
  var event = {
    altKey: false,
    ctrlKey: false,
    keyCode: 65,
    metaKey: false,
    shiftKey: false
  };
  equal(GpKey.getCommand(event), 'a');

  var event = {
    altKey: true,
    ctrlKey: true,
    keyCode: 65,
    metaKey: false,
    shiftKey: true
  };
  equal(GpKey.getCommand(event), '^&A');
});

test('get key name', function() {
  equal(GpKey._getKeyName(48), '0');
  equal(GpKey._getKeyName(57), '9');
  equal(GpKey._getKeyName(65), 'a');
  equal(GpKey._getKeyName(90), 'z');
  equal(GpKey._getKeyName(112), 'f1');
  equal(GpKey._getKeyName(123), 'f12');
  equal(GpKey._getKeyName(999), '');
});

// -------------

module('instance', {
  setup: function() {
    inst = build();
  }
});

test('add/remove commands', function() {
  var fn, fn2;

  fn = function() {};
  g_inst.addCommands('down', { 'a': fn });
  equal(g_inst.commands['down']['a'], fn, 'add');

  fn2 = function() {};
  g_inst.addCommands('down', { 'a': fn2 });
  equal(g_inst.commands['down']['a'], fn2, 'overwrite');

  g_inst.addCommands('down', { 'a': null });
  equal(g_inst.commands['down']['a'], null, 'remove');

  fn = function() {};
  var inst = build('down', { 'b': fn });
  equal(inst.commands['down']['b'], fn, 'constructor');
});

test('get handler', function() {
  equal(g_inst._getHandler('down', 'a'), null, 'not exist');

  g_inst.commands = { down: { a: true } };
  equal(g_inst._getHandler('down', 'a'), null, 'not function');

  var fn = function() {};
  g_inst.commands = { down: { a: fn } };
  equal(g_inst._getHandler('down', 'a'), fn, 'havning');
});

test('execute', 2, function() {
  var obj = {};
  g_inst._exec(function(event) {
    ok(true, 'calling');
    equal(event, obj, 'event');
  }, obj);
});

// -------------

module('interface', {
  setup: function() {
    inst = build();
  }
});

test('ctrl key status', function() {
  GpKey.ctrlPressed = true;
  ok($.gpKey.ctrl(), 'ctrl : true');

  GpKey.ctrlPressed = false;
  ok(!$.gpKey.ctrl(), 'ctrl : false');
});

test('alt key status', function() {
  GpKey.altPressed = true;
  ok($.gpKey.alt(), 'alt : true');

  GpKey.altPressed = false;
  ok(!$.gpKey.alt(), 'alt : false');
});

test('shift key status', function() {
  GpKey.shiftPressed = true;
  ok($.gpKey.shift(), 'shift : true');

  GpKey.shiftPressed = false;
  ok(!$.gpKey.shift(), 'shift : false');
});

test('add press commands', function() {
  var fn = function() {};
  g_$el.gpKey('press', {
    'a': fn
  });
  equal(g_inst.commands.press.a, fn);
});

test('add down commands', function() {
  var fn = function() {};
  g_$el.gpKey('down', {
    'a': fn
  });
  equal(g_inst.commands.down.a, fn);
});

test('add up commands', function() {
  var fn = function() {};
  g_$el.gpKey('up', {
    'a': fn
  });
  equal(g_inst.commands.up.a, fn);
});

test('trigger', 1, function() {
  g_$el.gpKey('up', {
    'a': function() {
      ok(true, 'call');
    }
  });
  g_$el.gpKey('trigger', 'up', 'a');
});
