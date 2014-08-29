$(function() {

	module('Subscription');
	test('Registration', function() {
		var hasTriggered = false,
			id = signal.subscribe('foo', function() { hasTriggered = true; });
		ok(_.isNumber(id), 'Events can subscribe');

		signal.dispatch('foo');
		ok(hasTriggered, 'Events can dispatch');

		hasTriggered = false;
		signal.unsubscribe('foo', id);
		signal.dispatch('foo');
		ok(!hasTriggered, 'Events can unsubscribe');
	});

	test('Multi Registration', function() {
		var hasOneTriggered = false,
			hasTwoTriggered = false,
			hasThreeTriggered = false;

		var oneId = signal.subscribe('bar', function() { hasOneTriggered = true; }),
			twoId = signal.subscribe('bar', function() { hasTwoTriggered = true; }),
			threeId = signal.subscribe('bar', function() { hasThreeTriggered = true; });

		signal.dispatch('bar');
		ok(hasOneTriggered && hasTwoTriggered && hasThreeTriggered, 'Can dispatch multiple functions under one name');

		hasOneTriggered = false;
		hasTwoTriggered = false;
		hasThreeTriggered = false;

		signal.unsubscribe('bar', twoId);
		signal.dispatch('bar');

		ok(hasOneTriggered && !hasTwoTriggered && hasThreeTriggered, 'Can unsubscribe single function, keeping others intact');
	});
});
