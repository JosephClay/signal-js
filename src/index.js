var extend = require('./extend');
var klass = require('./klass');
var Signal = require('./Signal');

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

// setup extension method
signal.extend = klass;

// Expose
module.exports = signal;