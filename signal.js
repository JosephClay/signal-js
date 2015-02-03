/*! signal-js - v0.1.1 - 2015-02-03 %>
 * https://github.com/JosephClay/signal-js
 * Copyright (c) 2013-2015 Joe Clay; License: MIT */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.signal=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var _ = require(5);
var klassExtend = require(4);
var Signal = require(2);

Signal.extend = klassExtend;

var create = function() {
	var s = new Signal();
	s.prototype = Signal.prototype;
	s.extend = klassExtend;
	return s;
};

// Create a pub/sub to expose signal as
// e.g. signal.on(), signal.trigger()
var signal = _.extend(create, create());
signal.prototype = Signal.prototype;

// setup create methods
signal.create = create;

// setup extension method
signal.extend = klassExtend;

// Expose
module.exports = signal;
},{}],2:[function(require,module,exports){
var undef, // safe undef
    _      = require(5),
    caller = require(3),

    /**
     * Holds cached, parsed event keys by string
     * @type {Object}
     */
    cache = {},

    parseConfig = function(str) {
        var index = str.indexOf('.');
        if (index === -1) { return { e: str, ns: '' }; }
        return { e: str.substr(0, index), ns: str.substr(index + 1) };
    },

    reassignEvents = function(handle, first, second) {
        second[handle] = second[handle] || {};
        _.extend(second[handle], first[handle]);
        delete first[handle];
    };

function Signal() {
    /**
     * Holds active events by handle + event + namespace
     * @type {Object}
     */
    this._active = {};

    /**
     * Holds inactive events by handle - lazy creation
     * @type {Object}
     */
    // this._inactive;
}

var fn = Signal.prototype = {

    constructor: Signal,

    // Disable | Enable *************************************
    // TODO: Disable and Enable
    disable: function() {},

    enable: function() {},

    // On | Off ************************************************
    on: function(name, fn) {
        var config   = cache[name] || (cache[name] = parseConfig(name)),
            e        = config.e,
            ns       = config.ns,
            location = this._active,
            evt      = location[e] || (location[e] = {}),
            ref      = evt[ns];

        if (!ref) {
            evt[ns] = fn;
        } else if (Array.isArray(ref)) {
            evt[ns].push(fn);
        } else {
            evt[ns] = [ref, fn];
        }

        return this;
    },

    off: function(name) {
        var config   = cache[name] || (cache[name] = parseConfig(name)),
            e        = config.e,
            ns       = config.ns,
            location = this._active,
            ref;

        // Has a namespace, wipe out that
        // specific namespace
        if (ns !== '') {
            if ((ref = location[e])) {
                // this could be a function or
                // an array, so wipe it out
                ref[ns] = undef;
            }
        } else {
            // Does not have a namespace
            // wipe out all events
            ref[e] = {};
        }

        return this;
    },

    // TODO: Improve once implementation
    // Based on underscore's once implementation
    once: function(eventname, callback) {
        var hasRan = false,
            memo;
        return this.on(eventname, function() {
            if (hasRan) { return memo; }
            hasRan = true;

            memo = callback.apply(this, arguments);
            callback = null;

            return memo;
        });
    },

    // Trigger ************************************************
    trigger: function(name) {
        var location  = this._active,
            config    = cache[name] || (cache[name] = parseConfig(name)),
            e         = config.e,
            ns        = config.ns,
            nsDefined = ns !== '',
            ref;

        // early return
        if (
            // the location doesn't exist
            !(ref = location[e]) ||
            // we have a namespace, but nothing
            // is registered there
            (nsDefined && !(ref = ref[ns]))
        ) { return this; }
        
        // we have a ref - which means we have a function
        // or an array of functions
        var args = arguments,
            length = args.length,
            call;

        if (length > 1) {
            // prevent this function from being de-optimized
            // because of using the arguments:
            // http://reefpoints.dockyard.com/2014/09/22/javascript-performance-for-the-win.html
            // We only need the arguments after the event name
            var idx = 1,
                argArr = new Array(length - 1);
            for (; idx < length; idx += 1) {
                argArr[idx - 1] = args[idx];
            }
            
            // create a caller
            call = caller.create(argArr);
        } else {
            call = caller.noArgs;
        }
        
        // determine how to call this event

        if (nsDefined) {
            if (Array.isArray(ref)) {
                // If there's a namespace, trigger only that array...
                caller.call(ref, call);
            } else {
                // ...or function
                call(ref);
            }
            return this;
        }

        // Else, trigger everything registered to the event
        var subSignal;
        for (var key in ref) {
            subSignal = ref[key];
            if (Array.isArray(subSignal)) {
                // If there's a namespace, trigger only that array...
                caller.call(subSignal, call);
            } else {
                // ...or function
                call(subSignal);
            }
        }
        return this;
    },

    // ListenTo | StopListening ********************************
    listenTo: function(obj, name, fn) {
        obj.on(name, fn);
        return this;
    },
    stopListening: function(obj, name, fn) {
        obj.off(name, fn);
        return this;
    }
};

// proxy methods
fn.addListener     = fn.subscribe   = fn.bind   = fn.on;
fn.removeListender = fn.unsubscribe = fn.unbind = fn.off;
fn.emit            = fn.dispatch    = fn.trigger;

module.exports = Signal;
},{}],3:[function(require,module,exports){
var apply = function(args) {
    return function(fn) {
        return fn.apply(null, args);
    };
};

var noArgs = function(fn) {
    return fn.call();
};

var callers = {
    1: function(args) {
        var one = args[0];
        return function(fn) {
            return fn.call(null, one);
        };
    },
    2: function(args) {
        var one = args[0],
            two = args[1];
        return function(fn) {
            return fn.call(null, one, two);
        };
    },
    3: function(args) {
        var one = args[0],
            two = args[1],
            three = args[2];
        return function(fn) {
            return fn.call(null, one, two, three);
        };
    }
};

module.exports = {
    create: function(args) {
        var len = args.length;

        // no args is easy
        if (len === 0) { return noArgs; }

        var caller = callers[len] || apply;
        return caller(args);
    },
    
    noArgs: noArgs,

    call: function(events, call) {
        var idx = 0, length = events.length,
            evt;
        for (; idx < length; idx += 1) {
            evt = events[idx];
            if (!evt) { continue; }
            if (call(evt) === false) { return; }
        }
    }
};
},{}],4:[function(require,module,exports){
var _ = require(5),
    Signal = require(2);

/**
 * Klass-like extend method
 * @param  {Function} constructor
 * @param  {Object} extension   prototype extension
 * @return {Function} constructor
 */
module.exports = function(constructor, extension) {
    var hasConstructor = (typeof constructor === 'function');
    if (!hasConstructor) { extension = constructor; }

    var fn = function() {
            var ret = Signal.apply(this, arguments);
            if (hasConstructor) {
                ret = constructor.apply(this, arguments);
            }
            return ret;
        };

    // Add properties to the object
    _.extend(fn, Signal);

    // Duplicate the prototype
    var NoOp = function() {};
    NoOp.prototype = Signal.prototype;
    fn.prototype = new NoOp();

    // Merge the prototypes
    _.extend(fn.prototype, Signal.prototype, extension);
    fn.prototype.constructor = constructor || fn;

    return fn;
};
},{}],5:[function(require,module,exports){
var id = 0;

module.exports = {
    /**
     * Unique Id
     * @type {Number}
     */
    uniqueId: function() {
        return id++;
    },

    /**
     * Object merger
     * @param {Objects}
     * @return {Object}
     */
    extend: function(base) {
        var args = arguments,
            idx = 1, length = args.length,
            key, merger;
        for (; idx < length; idx++) {
            merger = args[idx];

            for (key in merger) {
                base[key] = merger[key];
            }
        }

        return base;
    }
};
},{}]},{},[1])(1)
});