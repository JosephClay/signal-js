var undef, // safe undef
    _      = require('./utils'),
    caller = require('./caller'),

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
            length = args.length;

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
        var call = caller.create(argArr);
        
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