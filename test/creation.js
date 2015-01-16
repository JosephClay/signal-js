var _ = require('underscore'),
    signal = require('../src');

exports.create = function(test) {
    test.expect(2);

	test.ok(signal() && signal().on && signal().extend, 'can generate a new signal as a factory');
	test.ok(signal.create() && signal.create().on && signal.create().extend, 'can generate a new signal with create');

	test.done();
};