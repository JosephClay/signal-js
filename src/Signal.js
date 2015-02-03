var undef, // safe undef
    caller = require('./caller'),
    cache = require('./cache');

function Signal() {
    /**
     * Holds active events by handle + event + namespace
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
        } else if (Array.isArray(ref)) {
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

    // TODO
    listeners: function(name) {
    },
    count: function(name) {
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