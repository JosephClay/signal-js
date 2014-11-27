var _ = require('underscore'),
	signal = require('../src');

exports['Subscription: Registration'] = function(test) {
	test.expect(3);

	var hasTriggered = false,
		id = signal.subscribe('foo', function() { hasTriggered = true; });
	test.ok(_.isNumber(id), 'Events can subscribe');

	signal.dispatch('foo');
	test.ok(hasTriggered, 'Events can dispatch');

	hasTriggered = false;
	signal.unsubscribe('foo', id);
	signal.dispatch('foo');
	test.ok(!hasTriggered, 'Events can unsubscribe');

	test.done();
};

exports['Subscription: Multi Registration'] = function(test) {
	test.expect(2);

	var hasOneTriggered = false,
		hasTwoTriggered = false,
		hasThreeTriggered = false;

	var oneId = signal.subscribe('bar', function() { hasOneTriggered = true; }),
		twoId = signal.subscribe('bar', function() { hasTwoTriggered = true; }),
		threeId = signal.subscribe('bar', function() { hasThreeTriggered = true; });

	signal.dispatch('bar');
	test.ok(hasOneTriggered && hasTwoTriggered && hasThreeTriggered, 'Can dispatch multiple functions under one name');

	hasOneTriggered = false;
	hasTwoTriggered = false;
	hasThreeTriggered = false;

	signal.unsubscribe('bar', twoId);
	signal.dispatch('bar');

	test.ok(hasOneTriggered && !hasTwoTriggered && hasThreeTriggered, 'Can unsubscribe single function, keeping others intact');

	test.done();
};
