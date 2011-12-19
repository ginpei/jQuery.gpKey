/**
 * jQuery.gpKey 0.1
 * http://ginpen.com/jquery/gpkey/
 * https://github.com/ginpei/jQuery.gpKey
 *
 * Copyright (c) 2011 Takanashi Ginpei
 * http://ginpen.com
 *
 * Released under the MIT License for personal use.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * For other use, please contact me.
 */
;(function($) {
  try {
    if (window.com.ginpen.GpKey) { return; }
  } catch (e) {}

  if (!window.com) { window.com = {}; }
  if (!com.ginpen) { com.ginpen = {}; }

  var GpKey = com.ginpen.GpKey = function() {
    return this.__constructor.apply(this, arguments);
  };

  $.extend(GpKey, {
    /**
     * The version of this application.
     * @type String
     */
    VERSION: '0.1',

    /**
     * Default settings.
     * @type Object
     */
    settings: {
    },

    /**
     * @type Boolean
     */
    initialized: false,

    /**
     * @type Boolean
     */
    ctrlPressed: false,

    /**
     * @type Boolean
     */
    altPressed: false,

    /**
     * @type Boolean
     */
    shiftPressed: false,

    /**
     * @type GpKey
     */
    _curTarget: null,
    getCurTarget: function() { return this._curTarget; },
    _setCurTarget: function(obj) { return this._curTarget = obj; },

    /**
     * Init globally
     */
    initialize: function() {
      // run once
      if (this.initialized) {
        return;
      }
      this.initialized = true;

      var that = this;

      $(document)
        .mousedown(function(event) {
          var target = that._findTarget($(event.target));
          that.updateCurTarget(target);
        })
        .keypress(function(event) {
          that._updateModifierKeysStatus(event);
          that._fire(event);
        })
        .keydown(function(event) {
          that._updateModifierKeysStatus(event);
          that._fire(event);
        })
        .keyup(function(event) {
          that._updateModifierKeysStatus(event);
          that._fire(event);
        });
      $(window)
        .blur(function(event) {
          that._updateModifierKeysStatus({});
        });
    },

    /**
     * Find target from the element.
     * @param {HtmlElement} $el
     * @returns {GpKey} The target instance.
     */
    _findTarget: function($el) {
      var $target = $el.closest('.gpkey');
      return $target.data('gpkey');
    },

    /**
     * Remember current target.
     * @param {GpKey} inst
     */
    updateCurTarget: function(inst) {
      var last = this.getCurTarget();
      if (last) {
        last.$el
          .removeClass('gpkey-current')
          .trigger('blur.gpkey');
      }

      this._setCurTarget(inst);
      if (inst) {
        inst.$el
          .addClass('gpkey-current')
          .trigger('focus.gpkey');
      }
    },

    /**
     * @param {Event} event
     */
    _updateModifierKeysStatus: function(event) {
      this.ctrlPressed = !!event.ctrlKey || !!event.metaKey;
      this.altPressed = !!event.altKey;
      this.shiftPressed = !!event.shiftKey;
    },

    /**
     * Execute handler.
     * @param {Event} event
     */
    _fire: function(event) {
      var inst = this.getCurTarget();
      if (!inst) {
        return;
      }

      var type = this._fixTypeName(event.type);
      var command = this.getCommand(event);

      var executed = inst.trigger(type, command);
      if (executed) {
        event.preventDefault();
      }
    },

    /**
     * Return command by the event.
     * @param {Event} event
     * @returns {String} Command. ex) "a", "^&A", "space".
     */
    getCommand: function(event) {
      var command = '';

      if (event.ctrlKey || event.metaKey) {
        command += '^';
      }

      if (event.altKey) {
        command += '&';
      }

      var key = this._getKeyName(event.keyCode);
      if (event.shiftKey) {
        command += key.toUpperCase();
      }
      else {
        command += key;
      }

      return command;
    },

    /**
     * Get name of key code.
     * @param {Number} code The key code.
     * @returns {String} ex) "a", "space"
     */
    _getKeyName: function(code) {
      if (code == 8) { return 'backspace'; }
      else if (code == 9) { return 'tab'; }
      else if (code == 13) { return 'enter'; }
      else if (code == 27) { return 'escape'; }
      else if (code == 32) { return 'space'; }
      else if (code == 46) { return 'delete'; }
      // arrow
      else if (code == 37) { return 'left'; }
      else if (code == 38) { return 'up'; }
      else if (code == 39) { return 'right'; }
      else if (code == 40) { return 'down'; }
      // number
      else if (48 <= code && code <= 57) {
        return (code - 48).toString();
      }
      // charctor
      else if (65 <= code && code <= 90) {
        return String.fromCharCode(code).toLowerCase();
      }
      // function
      else if (112 <= code && code <= 123) {
        return 'f' + (code - 111);
      }
      else {
        return '';
      }
    },

    /**
     * Initialize target.
     * @param {HtmlElement} $el Target element.
     * @param {String} type Event type.
     * @param {Object} commands Commands list.
     * @param {Object} [settings] User preferences.
     */
    addTarget: function($el, type, commands, settings) {
      // initialize globaly once
      this.initialize();

      // build and store instance, and initialize the elemenent
      var inst = new GpKey($el, settings);
      $el
        .data('gpkey', inst)
        .addClass('gpkey');

      // store commands if type is valid
      var type = this._fixTypeName(type);
      if (type) {
        inst.addCommands(type, commands);
      }
    },

    /**
     * @param {String} type
     * @returns {String} Fixed type name.
     */
    _fixTypeName: function(type) {
      if (type == 'press' || type == 'keypress') {
        return 'press';
      }
      else if (type == 'down' || type == 'keydown') {
        return 'down';
      }
      else if (type == 'up' || type == 'keyup') {
        return 'up';
      }
      else {
        return '';
      }
    },

    "": 0  // guard
  });

  $.extend(GpKey.prototype, {
    /**
     * The constructor.
     */
    __constructor: function($el, settings) {
      this.$el = $el;
      this.commands = {};
      this.settings = settings;
    },

    /**
     * Store commands.
     * @param {String} type Event type.
     * @param {Object} commands
     */
    addCommands: function(type, commands) {
      if (!(type in this.commands)) {
        this.commands[type] = {};
      }
      var myCommands = this.commands[type];

      for (var command in commands) {
        var fn = commands[command];
        if (fn == null) {
          delete myCommands[command];
        }
        else {
          myCommands[command] = fn;
        }
      }
    },

    /**
     * Add commands for "keypress".
     * @param {Object} commands
     * @see #addCommands
     */
    press: function(commands) {
      return this.addCommands('press', commands);
    },

    /**
     * Add commands for "keydown".
     * @param {Object} commands
     * @see #addCommands
     */
    down: function(commands) {
      return this.addCommands('down', commands);
    },

    /**
     * Add commands for "keyup".
     * @param {Object} commands
     * @see #addCommands
     */
    up: function(commands) {
      return this.addCommands('up', commands);
    },

    /**
     * Execute command.
     * @param {String} type
     * @param {String} command
     * @returns {Boolean} True if executed.
     */
    trigger: function(type, command) {
      var fn = this._getHandler(type, command);
      if (fn) {
        this._exec(fn);
        return true;
      }
      else {
        return false;
      }
    },

    /**
     * Return true if handler is stored.
     * @param {String} type
     * @param {String} command
     */
    _getHandler: function(type, command) {
      if (type in this.commands) {
        var fn = this.commands[type][command];
        if ($.isFunction(fn)) {
          return fn;
        }
      }

      else null;
    },

    /**
     * @param {Function} fn
     * @param {Event} [event]
     */
    _exec: function(fn, event) {
      fn.apply(this.$el[0], [event]);
    },

    /**
     * Set this to current target.
     * @param {Function} [callback]
     */
    focus: function(callback) {
      GpKey.updateCurTarget(this);

      if ($.isFunction(callback)) {
        callback.apply(this.$el, [this]);
      }
    },

    /**
     * Unset this to current target.
     * @param {Function} [callback]
     */
    blur: function(callback) {
      GpKey.updateCurTarget(null);

      if ($.isFunction(callback)) {
        callback.apply(this.$el, [this]);
      }
    },

    "": 0  // guard
  });

  // jQuery method interface
  $.gpKey = {
    alt: function() { return GpKey.altPressed; },
    ctrl: function() { return GpKey.ctrlPressed; },
    initialize: function() { GpKey.initialize(); },
    shift: function() { return GpKey.shiftPressed; }
  };
  $.fn.gpKey = function(type, commands, settings) {
    var inst = $(this).data('gpkey');
    if (inst &&
        type &&
        type.charAt(0) != '_' &&
        $.isFunction(inst[type])
    ) {
      return inst[type](commands, settings);
    }
    else {
      return this.each(function(i, el) {
        GpKey.addTarget($(el), type, commands, settings);
      });
    }
  };
}(jQuery));
