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