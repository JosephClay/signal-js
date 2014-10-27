(function(name, definition) {

    if (typeof define === 'function') { // RequireJS
        define(function() { return definition; });
    } else if (typeof module !== 'undefined' && module.exports) { // CommonJS
        module.exports = definition;
    } else { // Browser
        this[name] = definition;
    }

})('signal', function(undefined) {

	var _splice = [].splice,
		_ripFirstArg = function(arr) {
			return _splice.call(arr, 0, 1)[0];
		},

		/**
		 * Object merger
		 * @param {Objects}
		 * @return {Object}
		 */
		_extend = function(base) {
			var args = arguments,
				idx = 1, length = args.length,
				key, merger;
			for (; idx < length; idx++) {
				merger = args[idx];

				for (key in merger) {
					base[key] = merger[key];
				}
			}

			return base;
		},

		/**
		 * Holds cached, parsed event keys by string
		 * @type {Object}
		 */
		_cache = {},

		/**
		 * Unique Id
		 * @type {Number}
		 */
		_id = 0,
		_uniqueId = function() {
			return _id++;
		},

		/**
		 * Cached regex used to parse event string
		 * @type {RegExp}
		 */
		_NAME_REGEX = /(?:([\w-]+):)?([\w-]*)(?:.([\w-]+))?/,
		_parseConfig = function(eventname) {
			var match = _NAME_REGEX.exec(eventname);
			return {
				// [0] : the entire match, don't care!
				// [1] : handle
				h:  (match[1] === undefined) ? '' : match[1],
				// [2] : event
				e:  (match[2] === undefined) ? '' : match[2],
				// [3] : namespace
				ns: (match[3] === undefined) ? '' : match[3]
			};
		},

		_reassignEvents = function(handle, first, second) {
			second[handle] = second[handle] || {};
			_extend(second[handle], first[handle]);
			delete first[handle];
		},

		_callEvents = function(events, args) {
			args = args || [];

			var idx = 0, length = events.length,
				evt, params;
			for (; idx < length; idx += 1) {
				evt = events[idx];
				if (!evt) { continue; }

				params = evt.length;
				if (params === 1) {
					if (evt(args[0]) === false) { return; }
					continue;
				}
				if (params === 2) {
					if (evt(args[0], args[1]) === false) { return; }
					continue;
				}
				if (params === 3) {
					if (evt(args[0], args[1], args[2]) === false) { return; }
					continue;
				}
				if (evt.apply(null, args) === false) {
					return;
				}
			}
		},

		_eventLookup = function(eventConfig, location) {
			var handle    = location[eventConfig.h] || (location[eventConfig.h] = {}),
				evt       = handle[eventConfig.e]   || (handle[eventConfig.e]   = {}),
				namespace = evt[eventConfig.ns]     || (evt[eventConfig.ns]     = []);

			return namespace;
		};

	/**
	 * Klass-like extend method
	 * @param  {Function} constructor
	 * @param  {Object} extension   prototype extension
	 * @return {Function} constructor
	 */
	var klassExtend = function(constructor, extension) {
		var hasConstructor = (typeof constructor === 'function');
		if (!hasConstructor) { extension = constructor; }

		var fn = function() {
				var ret = Signal.apply(this, arguments);
				if (hasConstructor) {
					ret = constructor.apply(this, arguments);
				}
				return ret;
			};

		// Add properties to the object
		_extend(fn, Signal);

		// Duplicate the prototype
		var NoOp = function() {};
		NoOp.prototype = Signal.prototype;
		fn.prototype = new NoOp();

		// Merge the prototypes
		_extend(fn.prototype, Signal.prototype, extension);
		fn.prototype.constructor = constructor || fn;

		return fn;
	};

	var create = function() {
		var signal = new Signal();
		signal.extend = klassExtend;
		return signal;
	};

	function Signal() {
		/**
		 * Holds active events by handle + event + namespace
		 * @type {Object}
		 */
		this._active = {};

		/**
		 * Holds inactive events by handle - lazy creation
		 * @type {Object}
		 */
		// this._inactive;

		/**
		 * Holds subscriptions - lazy creation
		 * @type {Object}
		 */
		// this._subs;
	}

	Signal.extend = klassExtend;

	Signal.prototype = {

		constructor: Signal,

		/**
		 * Returns a new signal instance
		 * @return {signal}
		 */
		construct: create,
		create: create,

		subscribe: function(name, func) {
			var subscriptions = this._subs || (this._subs = {});

			var id = _uniqueId(),
				location = subscriptions[name] || (subscriptions[name] = []);

			func.__signal_id__ = id;
			location.push(func);

			return id;
		},

		unsubscribe: function(name, id) {
			var subscriptions = this._subs || (this._subs = {});

			var location = subscriptions[name];
			if (!location) { return; }

			var idx = 0, length = location.length;
			for (; idx < length; idx += 1) {
				if (location[idx].__signal_id__ === id) {
					location.splice(idx, 1);
					return true;
				}
			}

			return false;
		},

		dispatch: function() {
			var subscriptions = this._subs || (this._subs = {});

			var args = arguments,
				name = _ripFirstArg(args),
				location = subscriptions[name] || (subscriptions[name] = []),
				idx = 0, length = location.length,
				func;
			for (; idx < length; idx++) {
				func = location[idx];
				if (func) { func.apply(null, args); }
			}
		},

		// Disable | Enable *************************************
		disable: function(handle) {
			var active = this._active,
				inactive = this._inactive || (this._inactive = {});

			_reassignEvents(handle, active, inactive);

			return this;
		},

		enable: function(handle) {
			var active = this._active,
				inactive = this._inactive || (this._inactive = {});

			_reassignEvents(handle, inactive, active);

			return this;
		},

		// On | Off ************************************************
		on: function(eventname, callback) {
			var eventConfig = _cache[eventname] || (_cache[eventname] = _parseConfig(eventname));

			_eventLookup(eventConfig, this._active).push(callback);

			return this;
		},
		bind: function() { this.on.apply(this, arguments); },

		off: function(eventname) {
			var active = this._active,
				eventConfig = _cache[eventname] || (_cache[eventname] = _parseConfig(eventname));

			if (eventConfig.e === '') { // Removing a namespace

				var events = active[eventConfig.h],
					eventName,
					namespaceName;
				for (eventName in events) {
					for (namespaceName in events[eventName]) {
						if (namespaceName === eventConfig.ns) {
							active[eventConfig.h][eventName][namespaceName].length = 0;
						}
					}
				}

			} else if (eventConfig.ns !== '') { // Has a namespace

				if (active[eventConfig.h] &&
					active[eventConfig.h][eventConfig.e] &&
						active[eventConfig.h][eventConfig.e][eventConfig.ns]) {

					active[eventConfig.h][eventConfig.e][eventConfig.ns].length = 0;

				}

			} else { // Does not have a namespace

				if (active[eventConfig.h]) {
					active[eventConfig.h][eventConfig.e] = { '': [] };
				}

			}

			return this;
		},
		unbind: function() { this.off.apply(this, arguments); },

		// Based on underscore's once implementation
		once: function(eventname, callback) {
			var hasRan = false,
				memo;
			return this.on(eventname, function() {
				if (hasRan) { return memo; }
				hasRan = true;

				memo = callback.apply(this, arguments);
				callback = null;

				return memo;
			});
		},

		// Trigger ************************************************
		trigger: function() {
			var args = arguments,
				active = this._active,
				eventname = _ripFirstArg(args),
				eventConfig = _cache[eventname] || (_cache[eventname] = _parseConfig(eventname)),
				// Always do an event lookup. This ensures that the location
				// of the event has been created so that calls to trigger
				// for events that haven't been registered don't throw exceptions
				location = _eventLookup(eventConfig, active);

			if (eventConfig.ns !== '') { // If there's a namespace, trigger only that array

				_callEvents(location, args);

			} else { // Else, trigger everything registered to the event

				var subSignal = active[eventConfig.h][eventConfig.e],
					key;
				for (key in subSignal) {
					_callEvents(subSignal[key], args);
				}

			}

			return this;
		},

		// ListenTo | StopListening ********************************
		listenTo: function(obj, eventname, callback) {
			obj.on(eventname, callback);
			return this;
		},
		stopListening: function(obj, eventname) {
			obj.off(eventname);
			return this;
		}
	};

	// Create a pub/sub to expose signal as
	// e.g. signal.on(), signal.trigger()
	var signal = new Signal();

	// setup extension method
	signal.extend = klassExtend;

	// Expose
	return signal;

}());
