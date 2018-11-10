import test from 'tape';
import src from '../src';
import key from '../src/key';
import isObject from 'lodash/isObject';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';

test('global', assert => {
	assert.plan(3);

	const signal = src;
	assert.ok(isFunction(signal.on), `signal is a singleton`);
	assert.ok(isFunction(signal.emit), `signal is a singleton`);
	assert.ok(signal[key], `signal has a Map`);

	assert.end();
});

test('factory', assert => {
	assert.plan(4);

	const signal = src;
	assert.ok(isFunction(signal), `signal is a factory`);
	assert.doesNotThrow(() => signal(), `signal can be called`);
	assert.ok(isFunction(signal()), `signal factory creates a factory`);
	assert.ok(isFunction(signal().on), `created signal has methods`);

	assert.end();
});

test('instancing', assert => {
	assert.plan(9);
	
	const signal = src;
	const local1 = src();
	const local2 = local1();

	let globalTrigger = 0;
	let local1Trigger = 0;
	let local2Trigger = 0;

	signal.on('foo', () => { globalTrigger += 1; });
	local1.on('foo', () => { local1Trigger += 1; });
	local2.on('foo', () => { local2Trigger += 1; });

	signal.trigger('foo');
	assert.is(globalTrigger, 1, `global fired`);
	assert.is(local1Trigger, 0, `local1 did not fire`);
	assert.is(local2Trigger, 0, `local2 did not fire`);
	
	local1.trigger('foo');
	assert.is(globalTrigger, 1, `global did not fire`);
	assert.is(local1Trigger, 1, `local1 fired`);
	assert.is(local2Trigger, 0, `local2 did not fire`);
	
	local2.trigger('foo');
	assert.is(globalTrigger, 1, `global did not fire`);
	assert.is(local1Trigger, 1, `local1 did not fire`);
	assert.is(local2Trigger, 1, `local2 fired`);

	assert.end();
});

test('event: add', assert => {
	assert.plan(4);

	const signal = src();
	assert.doesNotThrow(() => signal.on('foo', () => {}), `valid registration does not throw`);
	assert.throws(() => signal.on(null, () => {}), `an invalid name throws`);
	assert.throws(() => signal.on('foo', null), `an invalid callback throws`);
	assert.ok(isObject(signal.on(1, () => {})), `can listen to an id/number`);

	assert.end();
});

test('event: symbol', assert => {
	assert.plan(3);

	const signal = src();
	const symbol = Symbol('foo');
	let trigger = false;
	assert.doesNotThrow(() => signal.on(symbol, function() { trigger = true; }), `symbol .on does not throw`);
	assert.doesNotThrow(() => signal.emit(symbol), `symbol .emit does not throw`);
	assert.is(trigger, true, `symbol event fired`);
	
	assert.end();
});

test('event: emit', assert => {
	assert.plan(3);

	const signal = src();
	let trigger = false;
	signal.on('foo:bar.baz', function() { trigger = true; });
	signal.trigger('foo:bar.baz');

	assert.ok(trigger, `events can trigger`);

	trigger = false;
	signal.emit('foo:bar.baz');
	
	assert.ok(trigger, `emit is a proxy`);

	assert.throws(() => signal.trigger(), `an event name is required to trigger`);

	assert.end();
});

test('event: emit empty', assert => {
	assert.plan(1);

	const signal = src();
	assert.doesNotThrow(() => signal.trigger('nothing.here'), `can trigger without a listener`);
	
	assert.end();
});

test('event: remove', assert => {
	assert.plan(3);

	const signal = src();
	const evt = 'foo:bar.baz';
	let trigger = 0;
	const fn1 = () => { trigger += 1; };
	const fn2 = () => { trigger += 1; };
	signal.on(evt, fn1);
	signal.on(evt, fn2);
	
	assert.is(signal.size(evt), 2, `successful registered events`);
	signal.off(evt);
	assert.is(signal.size(evt), 0, `successful removed events`);

	signal.trigger(evt);
	assert.is(trigger, 0, `event unbound successfully`);

	assert.end();
});

test('event: remove specific', assert => {
	assert.plan(2);

	const signal = src();
	const fn1 = () => {};
	const fn2 = () => {};

	signal.on('foo', fn1);
	signal.on('foo', fn2);

	assert.ok(signal.listeners('foo').length, 2, `registered functions`);

	signal.off('foo', fn1);

	assert.ok(signal.listeners('foo').length, 1, `only removed one function`);

	assert.end();
});

test('event: remove invalid', assert => {
	assert.plan(1);
	
	const signal = src();
	assert.throws(() => signal.off(), `an event name is required for off`);

	assert.end();
});

test('event: once', assert => {
	assert.plan(6);

	const signal = src();
	let trigger = 0;
	signal.once('foo', () => { trigger += 1; });

	assert.is(signal.listeners('foo').length, 1, `registered the event using once`);
	signal.trigger('foo');
	assert.is(trigger, 1, `event has been called`);
	assert.is(signal.listeners('foo').length, 0, `event has been removed after being called`);
	signal.trigger('foo');
	assert.is(trigger, 1, `calling event again as not effect`);
	
	assert.throws(() => signal.once(undefined, () => {}), `once requires an event name`);
	assert.throws(() => signal.once('foo'), `once requires an function`);

	assert.end();
});

test('event: multiple', assert => {
	assert.plan(1);
	
	const signal = src();
	let trigger = 0;
	const fn = () => { trigger += 1; };
	signal.on('foo', fn);
	signal.on('foo.bar', fn);
	signal.on('bar', fn);
	signal.on('bar.foo', fn);

	signal.trigger('foo')
		.trigger('foo.bar')
		.trigger('bar')
		.trigger('bar.foo')
		.trigger('baz');
	assert.is(trigger, 4, `calling multiple events has the desired effect`);
	
	assert.end();
});

test('params', assert => {
	assert.plan(10);

	const signal = src();

	let boolTest;
	let objectTest;
	let arrayTest;
	let numberTest;
	let stringTest;
	let undefTest;
	let nullTest;
	let nanTest;
	let infinTest;
	let fnTest;

	signal.on('paramtest', function(
		param1,
		param2,
		param3,
		param4,
		param5,
		param6,
		param7,
		param8,
		param9,
		param10
	) {
		if (param1 === false) boolTest = true;
		if (isPlainObject(param2)) objectTest = true;
		if (Array.isArray(param3)) arrayTest = true;
		if (param4 === 0) numberTest = true;
		if (param5 === '') stringTest = true;
		if (param6 === undefined) undefTest = true;
		if (param7 === null) nullTest = true;
		if (Number.isNaN(param8)) nanTest = true;
		if (param9 === Infinity) infinTest = true;
		if (isFunction(param10)) fnTest = true;
	});

	signal.trigger('paramtest',
		false,
		{},
		[],
		0,
		'',
		undefined,
		null,
		NaN,
		Infinity,
		() => {}
	);
	
	assert.ok(boolTest, `Booleans can be passed`);
	assert.ok(objectTest, `Objects can be passed`);
	assert.ok(arrayTest, `Arrays can be passed`);
	assert.ok(numberTest, `Numbers can be passed`);
	assert.ok(stringTest, `Strings can be passed`);
	assert.ok(undefTest, `undefined can be passed`);
	assert.ok(nullTest, `null can be passed`);
	assert.ok(nanTest, `NaN can be passed`);
	assert.ok(infinTest, `Infinity can be passed`);
	assert.ok(fnTest, `Function can be passed`);

	assert.end();
});

test('listeners', assert => {
	assert.plan(5);

	const empty = src();
	assert.is(empty.listeners().length, 0, 'an empty instance has no functions');

	const signal = src();
	const fn1 = () => {};
	const fn2 = () => {};
	
	signal.on('foo', fn1);
	
	assert.ok(Array.isArray(signal.listeners('foo')), `an array of functions can be retrieved`);
	assert.ok(isFunction(signal.listeners('foo')[0]), `there are functions in the array`);
	
	signal.on('foo', fn2);
	assert.is(signal.listeners('foo').length, 2, `multiple registered functions are retrieved`);
	
	signal.on('bar', () => {});
	assert.is(signal.listeners().length, 3, `all registered functions are retrieved`);

	assert.end();
});

test('names', assert => {
	assert.plan(4);

	const signal = src();
	signal.on('foo', () => {});
	
	assert.ok(Array.isArray(signal.names()), `an array of names can be retrieved`);
	assert.is(signal.names()[0], 'foo', `there are event names in the array`);
	
	signal.on('foo', () => {});
	assert.is(signal.names().length, 1, `multiple registered functions under a single name allow for only one name entry`);
	
	signal.on('bar', () => {});
	assert.is(signal.names().length, 2, `multiple names can be retrieved`);

	assert.end();
});

test('size', assert => {
	assert.plan(4);

	const signal = src();
	signal.on('foo', () => {});
	
	assert.is(signal.size(), 1, `one event results in a size of 1`);
	
	signal.on('foo', () => {});
	assert.is(signal.size(), 2, `two events under the same event name results in a size of 2`);
	
	signal.on('bar', () => {});
	assert.is(signal.size(), 3, `multiple names keeps a consistent count`);
	
	assert.is(signal.size('foo'), 2, `a size of a single name can be queried`);

	assert.end();
});

test('disable/enable', assert => {
	assert.plan(10);

	const signal = src();
	let trigger = 0;
	const fn = () => { trigger += 1; };
	
	signal.on('foo', fn);
	signal.trigger('foo');

	assert.ok(isFunction(signal.disable), `disable is a function`);
	assert.ok(isFunction(signal.enable), `enable is a function`);
	assert.is(trigger, 1, `can trigger an event`);

	assert.doesNotThrow(() => signal.disable(), `disable doesn't throw`);
	assert.doesNotThrow(() => signal.disable(), `calling disable multiple times doesn't throw`);
	assert.doesNotEqual(() => signal.trigger('foo'), `calling a disabled signal doesn't throw`);
	assert.is(trigger, 1, `when disabled, the event is not called`);
	
	assert.doesNotThrow(() => signal.enable(), `enable doesn't throw`);
	assert.doesNotThrow(() => signal.enable(), `calling enable multiple times doesn't throw`);
	signal.trigger('foo');
	assert.is(trigger, 2, `when re-enabled, the event is called`);

	assert.end();
});

test('clear', assert => {
	assert.plan(7);
	
	const signal = src();
	let trigger = 0;
	const fn = () => { trigger += 1; };
	
	signal.on('foo', fn);
	signal.on('bar', fn);

	signal.trigger('foo');
	assert.is(trigger, 1, `foo triggered`);
	signal.trigger('bar');
	assert.is(trigger, 2, `bar triggered`);

	assert.ok(isFunction(signal.clear), `clear is a function`);
	assert.doesNotThrow(() => signal.clear(), `calling clear does not throw`);
	assert.doesNotThrow(() => signal.clear(), `calling clear multiple times does not throw`);

	signal.trigger('foo');
	assert.is(trigger, 2, `foo did not trigger`);
	signal.trigger('bar');
	assert.is(trigger, 2, `bar did not trigger`);

	assert.end();
});

test('chaining', assert => {
	assert.plan(1);

	assert.doesNotThrow(() => {
		return src()
			.on('foo', () => {})
			.emit('foo')
			.off('foo')
			.once('bar', () => {})
			.emit('bar')
			.disable()
			.enable()
			.clear();
	});

	assert.end();
});