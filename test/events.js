var _ = require('underscore'),
    signal = require('../src');

exports['event: registration'] = function(test) {
	test.expect(8);

	var hasTriggered = false,
		registration = signal.on('foo:bar.baz', function() { hasTriggered = true; });
	test.ok(_.isObject(registration), 'Events can register');

	test.ok(signal._active.foo.bar.baz, 'events can be retrieved');

	signal.trigger('foo:bar.baz');
	test.ok(hasTriggered, 'Events can trigger');

	hasTriggered = false;
	signal.off('foo:bar.baz');
	signal.trigger('foo:bar.baz');
	test.ok(!hasTriggered, 'Events can unbind');

	signal.on('one', function() { hasTriggered = true; });
	test.ok(signal._active[''].one, 'Single string can register');

	signal.trigger('one');
	test.ok(hasTriggered, 'Single string can trigger');

	hasTriggered = false;
	signal.on('one.two', function() { hasTriggered = true; });
	signal.trigger('one');
	test.ok(hasTriggered, 'Namespaced events trigger from event string');

	test.ok(_.isObject(signal.trigger('no:event.registered', function() {})), 'triggers to unregistered events fail silently');

	test.done();
};

exports['event: params'] = function(test) {
	test.expect(10);

	var has1, has2, has3, has4, has5, has6, has7, has8, has9;
	signal.on('paramtest', function(param1, param2, param3, param4, param5, param6, param7, param8, param9) {
		if (_.isBoolean(param1)) { has1 = true; }
		if (_.isObject(param2)) { has2 = true; }
		if (_.isArray(param3)) { has3 = true; }
		if (_.isNumber(param4)) { has4 = true; }
		if (_.isString(param5)) { has5 = true; }
		if (param6 === undefined) { has6 = true; }
		if (param7 === null) { has7 = true; }
		if (_.isNaN(param8)) { has8 = true; }
		if (param9 === Infinity) { has9 = true; }
	});
	signal.trigger('paramtest', false, {}, [], 0, '', undefined, null, NaN, Infinity);
	test.ok(has1, 'Booleans can be passed');
	test.ok(has2, 'Objects can be passed');
	test.ok(has3, 'Arrays can be passed');
	test.ok(has4, 'Numbers can be passed');
	test.ok(has5, 'Strings can be passed');
	test.ok(has6, 'undefined can be passed');
	test.ok(has7, 'null can be passed');
	test.ok(has8, 'NaN can be passed');
	test.ok(has9, 'Infinity can be passed');

	signal.on('paramtest', function(param1, param2, param3) {
		test.ok(param1 === 'one' &&
			param2 === 'two' &&
			param3 === 'three', 'Params passed in order');
	});
	signal.trigger('paramtest', 'one', 'two', 'three');

	test.done();
};

exports['event: handles'] = function(test) {
	test.expect(2);

	var hasTriggered = false;
	signal.on('six:one', function() { hasTriggered = true; });

	signal.disable('six').trigger('six:one');
	test.ok(!hasTriggered, 'Can disable handle');

	signal.enable('six').trigger('six:one');
	test.ok(hasTriggered, 'Can enable handle');

	test.done();
};