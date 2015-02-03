var _ = require('./utils');
var klassExtend = require('./klassExtend');
var Signal = require('./Signal');

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