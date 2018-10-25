import { single, multiple } from './caller';
import key from './key';

const formatMessage = (method, message) => `signal-js: method .${method} ${message}`;

const isNumber = value => typeof value === 'number';

const isString = value => typeof value === 'string';

// https://gist.github.com/Integralist/749153aa53fea7168e7e
const flatten = list => list.reduce(
	(memo, value) => memo.concat(Array.isArray(value) ? flatten(value) : value), []
);

const proto = {
	// disable | enable *************************************
	disable() {
		this.disabled = true;
		return this;
	},

	enable() {
		this.disabled = false;
		return this;
	},

	// on | off ************************************************
	on(name, fn) {
		if (!isNumber(name) && !isString(name)) throw new Error(formatMessage('on', 'requires an event name'));
		if (!fn) throw new Error(formatMessage('on', 'requires a function'));

		const location = this[key];
		const fns = location.has(name) ? location.get(name) : location.set(name, []).get(name);
		fns.push(fn);
		
		return this;
	},

	off(name, fn) {
		if (!isNumber(name) && !isString(name)) throw new Error(formatMessage('off', 'requires an event name'));

		const location = this[key];  

		if (!location.has(name)) return this;

		// remove single
		if (fn) {
			const fns = location.get(name);
			const index = fns.indexOf(fn);
			index !== -1 && fns.splice(index, 1);
			return this;
		}

		// remove all
		location.delete(name);
		return this;
	},

	once(name, fn) {
		if (!isNumber(name) && !isString(name)) throw new Error(formatMessage('once', 'requires an event name'));
		if (!fn) throw new Error(formatMessage('once', 'requires a function'));

		// slow path the params...this is for flexibility
		// and since these are single calls, the depotimization
		// shouldn't be a concern
		const callback = (...parms) => {
			this.off(name, callback);
			fn(...parms);
		};
		return this.on(name, callback);
	},

	// trigger ************************************************
	trigger(name, arg) {
		if (!isNumber(name) && !isString(name)) throw new Error(formatMessage('trigger', 'requires an event name'));

		if (this.disabled) return this;

		const location = this[key];

		// nothing at the location
		if (!location.has(name)) return this;

		const fns = location.get(name);

		// no events at the location
		if (!fns.length) return this;

		// we have an array of functions to call
		const args = arguments;
		const length = args.length;
		
		// fast path
		if (length <= 2) {
			single(fns, arg);
			return this;
		}

		// prevent this function from being de-optimized
		// because of using the arguments:
		// http://reefpoints.dockyard.com/2014/09/22/javascript-performance-for-the-win.html
		// We only need the arguments after the event name
		let idx = 1;               
		const argsArray = new Array(length - 1);
		for (; idx < length; idx += 1) {
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
		return name === undefined ? flatten(Array.from(location.values())) :
			location.has(name) ? location.get(name).slice() : [];
	},
	
	names() {
		const location = this[key];
		return Array.from(location.keys());
	},

	size(name) {
		return this.listeners(name).length;
	},

	// clear ************************************************
	clear() {
		this[key].clear();
		return this;
	},
};

// proxy methods
proto.addListener = proto.subscribe = proto.bind = proto.on;
proto.removeListender = proto.unsubscribe = proto.unbind = proto.off;
proto.emit = proto.dispatch = proto.trigger;

export default proto;