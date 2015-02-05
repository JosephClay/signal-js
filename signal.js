/*! signal-js - v0.1.1 - 2015-02-03 %>
 * https://github.com/JosephClay/signal-js
 * Copyright (c) 2013-2015 Joe Clay; License: MIT */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.signal=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var extend = require(5),
	klass  = require(6),
	Signal = require(2),
	cache  = require(3);

Signal.extend = klass;

var create = function() {
	var s = new Signal();
	s.prototype = Signal.prototype;
	s.extend = klass;
	return s;
};

// Create a pub/sub to expose signal as
// e.g. signal.on(), signal.trigger()
var signal = extend(create, create());
signal.prototype = Signal.prototype;

// setup create methods
signal.create = create;

signal.clearCache = cache.clear;

// setup extension method
signal.extend = klass;

// Expose
module.exports = signal;
},{}],2:[function(require,module,exports){
var undef, // safe undef
    caller  = require(4),
    cache   = require(3),
    isArray = Array.isArray;

var pullEvents = function(evt) {
    var subSignal, result = [];
    for (var key in evt) {
        subSignal = evt[key];
        if (isArray(subSignal)) {
            var idx = 0, length = subSignal.length;
            for (; idx < length; idx++) {
                result.push(subSignal[idx]);
            }
        } else {
            result.push(subSignal);
        }
    }
    return result;
};

function Signal() {
    /**
     * Holds active events by event + namespace
     * @type {Object}
     */
    this._events = {};
}

var fn = Signal.prototype = {

    constructor: Signal,

    // Disable | Enable *************************************
    disable: function() {
        this._disabled = true;
        return this;
    },

    enable: function() {
        this._disabled = false;
        return this;
    },

    // On | Off ************************************************
    on: function(name, fn) {
        // early return
        if (!fn) { return; }

        var config   = cache(name),
            e        = config.e,
            ns       = config.ns,
            location = this._events,
            evt      = location[e] || (location[e] = {}),
            ref      = evt[ns];

        if (!ref) {
            evt[ns] = fn;
        } else if (isArray(ref)) {
            evt[ns].push(fn);
        } else {
            evt[ns] = [ref, fn];
        }

        return this;
    },

    off: function(name) {
        var config   = cache(name),
            e        = config.e,
            ns       = config.ns,
            hasNs    = config.hasNs,
            location = this._events,
            ref;

        // Has a namespace, wipe out that
        // specific namespace
        if (hasNs) {
            if ((ref = location[e])) {
                // this could be a function or
                // an array, so wipe it out
                ref[ns] = undef;
            }
        }

        // Does not have a namespace
        // wipe out all events
        if (location[e]) {
            location[e] = {};
        }

        return this;
    },

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
        if (this._disabled) { return this; }

        var location  = this._events,
            config    = cache(name),
            e         = config.e,
            ns        = config.ns,
            hasNs     = config.hasNs,
            ref;

        // early return
        if (
            // the location doesn't exist
            !(ref = location[e]) ||
            // we have a namespace, but nothing
            // is registered there
            (hasNs && !(ref = ref[ns]))
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

        if (hasNs) {
            if (isArray(ref)) {
                // If there's a namespace, trigger only that array...
                caller.run(ref, call);
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
            if (isArray(subSignal)) {
                // If there's a namespace, trigger only that array...
                caller.run(subSignal, call);
            } else {
                // ...or function
                call(subSignal);
            }
        }
        return this;
    },

    listeners: function(name) {
        var location  = this._events;

        // all events
        if (name === undef) {
            var result = [];
            for (var evt in location) {
                result = result.concat(pullEvents(location[evt]));
            }
            return result;
        }

        // specific event
        var config    = cache(name),
            e         = config.e,
            ns        = config.ns,
            hasNs     = config.hasNs;

        // early return
        if (
            // the location doesn't exist
            !(ref = location[e]) ||
            // we have a namespace, but nothing
            // is registered there
            (hasNs && !(ref = ref[ns]))
        ) { return []; }

        // single namespace
        if (hasNs) {
            return !isArray(ref) ? [ref] : ref.slice();
        }

        // entire event
        return pullEvents(ref);
    },
    size: function(name) {
        return this.listeners(name).length;
    },

    // ListenTo | StopListening ********************************
    listenTo: function(obj, name, fn) {
        obj.on(name, fn);
        return this;
    },
    stopListening: function(obj, name) {
        obj.off(name);
        return this;
    }
};

// proxy methods
fn.addListener     = fn.subscribe   = fn.bind   = fn.on;
fn.removeListender = fn.unsubscribe = fn.unbind = fn.off;
fn.emit            = fn.dispatch    = fn.trigger;

module.exports = Signal;
},{}],3:[function(require,module,exports){
/**
 * Holds cached, parsed event keys by string
 * @type {Object}
 */
var cache = {};

var parse = function(name) {
    var index = name.indexOf('.');
    
    if (index === -1) {
        return {
            e: name,
            ns: '',
            hasNs: false,
        };
    }

    return {
        e: name.substr(0, index),
        ns: name.substr(index + 1).split('.').sort().join('.'),
        hasNs: true
    };
};

var api = module.exports = function(name) {
    return cache[name] || (cache[name] = parse(name));
};
api.clear = function() {
    cache = {};
};
},{}],4:[function(require,module,exports){
// functionally abstracting the calls
// to the function. this will net us
// better gains when looping through
// multiple namespaces and simplifies
// logic for calling the event.
// 
// this is slower than event-emitter,
// but ee doesn't have to worry about
// namespaces, so they can do it a
// little differently

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
        var length = args.length,
            caller = callers[length] || apply;
        return caller(args);
    },
    
    noArgs: noArgs,

    run: function(events, call) {
        var idx = 0, length = events.length,
            evt;
        for (; idx < length; idx += 1) {
            evt = events[idx];
            if (!evt) { continue; }
            if (call(evt) === false) { return; }
        }
    }
};
},{}],5:[function(require,module,exports){
/**
 * Object merger
 * @param {Objects}
 * @return {Object}
 */
module.exports = function(base) {
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
};
},{}],6:[function(require,module,exports){
var extend = require(5),
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
    extend(fn, Signal);

    // Duplicate the prototype
    var NoOp = function() {};
    NoOp.prototype = Signal.prototype;
    fn.prototype = new NoOp();

    // Merge the prototypes
    extend(fn.prototype, Signal.prototype, extension);
    fn.prototype.constructor = constructor || fn;

    return fn;
};
},{}]},{},[1])(1)
});