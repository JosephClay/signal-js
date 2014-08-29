$(function() {

	module('Event');
	test('Registration', function() {
		var hasTriggered = false,
			registration = signal.on('foo:bar.baz', function() { hasTriggered = true; });
		ok(_.isObject(registration), 'Events can register');

		ok(signal._active.foo.bar.baz, 'events can be retrieved');

		signal.trigger('foo:bar.baz');
		ok(hasTriggered, 'Events can trigger');

		hasTriggered = false;
		signal.off('foo:bar.baz');
		signal.trigger('foo:bar.baz');
		ok(!hasTriggered, 'Events can unbind');

		signal.on('one', function() { hasTriggered = true; });
		ok(signal._active[''].one, 'Single string can register');

		signal.trigger('one');
		ok(hasTriggered, 'Single string can trigger');

		hasTriggered = false;
		signal.on('one.two', function() { hasTriggered = true; });
		signal.trigger('one');
		ok(hasTriggered, 'Namespaced events trigger from event string');

		ok(_.isObject(signal.trigger('no:event.registered', function() {})), 'triggers to unregistered events fail silently');
	});

	test('Params', function() {
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
		ok(has1, 'Booleans can be passed');
		ok(has2, 'Objects can be passed');
		ok(has3, 'Arrays can be passed');
		ok(has4, 'Numbers can be passed');
		ok(has5, 'Strings can be passed');
		ok(has6, 'undefined can be passed');
		ok(has7, 'null can be passed');
		ok(has8, 'NaN can be passed');
		ok(has9, 'Infinity can be passed');

		signal.on('paramtest', function(param1, param2, param3) {
			ok(param1 === 'one' &&
				param2 === 'two' &&
				param3 === 'three', 'Params passed in order');
		});
		signal.trigger('paramtest', 'one', 'two', 'three');
	});

	test('Handles', function() {
		var hasTriggered = false;
		signal.on('six:one', function() { hasTriggered = true; });

		signal.disable('six').trigger('six:one');
		ok(!hasTriggered, 'Can disable handle');

		signal.enable('six').trigger('six:one');
		ok(hasTriggered, 'Can enable handle');
	});
});