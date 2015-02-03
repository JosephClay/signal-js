var extend = require('./extend'),
	klass  = require('./klass'),
	Signal = require('./Signal'),
	cache  = require('./cache');

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