$(function() {

	module('Subscription');
	test('Registration', function() {
		var hasTriggered = false,
			id = Signal.subscribe('foo', function() { hasTriggered = true; });
		ok(_.isString(id), 'Events can subscribe');
		
		Signal.dispatch('foo');
		ok(hasTriggered, 'Events can dispatch');

		hasTriggered = false;
		Signal.unsubscribe('foo', id);
		Signal.dispatch('foo');
		ok(!hasTriggered, 'Events can unsubscribe');
	});

	test('Multi Registration', function() {
		var hasOneTriggered = false,
			hasTwoTriggered = false,
			hasThreeTriggered = false;
		
		var oneId = Signal.subscribe('bar', function() { hasOneTriggered = true; }),
			twoId = Signal.subscribe('bar', function() { hasTwoTriggered = true; }),
			threeId = Signal.subscribe('bar', function() { hasThreeTriggered = true; });
		
		Signal.dispatch('bar');
		ok(hasOneTriggered && hasTwoTriggered && hasThreeTriggered, 'Can dispatch multiple functions under one name');

		hasOneTriggered = false;
		hasTwoTriggered = false;
		hasThreeTriggered = false;

		Signal.unsubscribe('bar', twoId);
		Signal.dispatch('bar');

		ok(hasOneTriggered && !hasTwoTriggered && hasThreeTriggered, 'Can unsubscribe single function, keeping others intact');
	});
});
