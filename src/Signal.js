import key from './key.js';
import SignalError from './SignalError.js';
import { single, multiple } from './caller.js';
import {
	isFunction,
	isString,
	isSymbol,
} from './utils.js';

const isValidKey = value => value != null && isString(value) || Number.isFinite(value) || isSymbol(value);

const proto = Object.assign(Object.create(null), {
	// on | off ************************************************
	on(name, fn) {
		if (!isValidKey(name)) throw SignalError('on', 'requires event name');
		if (!isFunction(fn)) throw SignalError('on', 'requires callback');

		const location = this[key];
		const fns = location.has(name) ? location.get(name) : location.set(name, new Set()).get(name);
		fns.add(fn);
		
		return this;
	},

	off(name, fn) {
		if (!isValidKey(name)) throw SignalError('off', 'requires event name');

		const location = this[key];  

		if (!location.has(name)) return this;

		// remove single
		if (fn) {
			const fns = location.get(name);
			
			// remove this function
			fns.has(fn) && fns.delete(fn);

			// check size and delete location if empty
			fns.size === 0 && location.delete(name);
			return this;
		}

		// remove all
		location.delete(name);
		return this;
	},

	once(name, fn) {
		if (!isValidKey(name)) throw SignalError('once', 'requires an event name');
		if (!isFunction(fn)) throw SignalError('once', 'requires a function');

		// slow path the params...this is for flexibility
		// and since these are single calls, the depotimization
		// shouldn't be a concern
		const callback = (...parms) => {
			this.off(name, callback);
			fn(...parms);
		};

		return this.on(name, callback);
	},

	// emit ************************************************
	emit(name, arg) {
		if (!isValidKey(name)) throw SignalError('emit', 'requires an event name');

		const location = this[key];

		// nothing at the location
		if (!location.has(name)) return this;

		const fns = location.get(name);

		// no events at the location
		if (!fns.size) return this;

		// we have an array of functions to call
		const args = arguments;
		const numOfArgs = args.length;
		
		// fast path
		if (numOfArgs <= 2) {
			single(fns, arg);
			return this;
		}

		// prevent this function from being de-optimized
		// because of using the arguments:
		// http://reefpoints.dockyard.com/2014/09/22/javascript-performance-for-the-win.html
		// We only need the arguments after the event name
		let idx = 1;
		const argsArray = new Array(numOfArgs - 1);
		for (; idx < numOfArgs; idx += 1) {
			argsArray[idx - 1] = args[idx];
		}

		multiple(fns, argsArray);
		return this;
	},

	// listeners / names ************************************************
	listeners(name) {
		const location = this[key];

		// make sure to always send an array and clean any 
		// references so that we cant mutate to undefined behavior
		
		if (name !== undefined) {
			return location.has(name) ? 
				Array.from(location.get(name)) : 
				[];
		}

		return Array.from(location.values())
				.map(set => Array.from(set))
				.flat();
	},
	
	names() {
		const location = this[key];
		return Array.from(location.keys());
	},

	size(name) {
		const location = this[key];

		// make sure to always send an array and clean any 
		// references so that we cant mutate to undefined behavior
		
		if (isValidKey(name)) {
			return location.has(name) ? 
				location.get(name).size : 
				0;
		}

		return Array.from(location.values())
			.reduce((memo, set) => memo + set.size, 0);
	},

	// clear ************************************************
	clear(name) {
		const location = this[key];

		if (isValidKey(name)) {
			location.has(name) && location.get(name).clear();
			return this;
		}

		this[key].clear();
		return this;
	},
});

// proxy methods
proto.addListener = proto.subscribe = proto.bind = proto.on;
proto.removeListender = proto.unsubscribe = proto.unbind = proto.off;
proto.trigger = proto.dispatch = proto.emit;

export default proto;