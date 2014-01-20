/*! Signal.js - v0.0.2 - 2013-11-23
 * https://github.com/JosephClay/Signal
 * Signal may be freely distributed under the MIT license. */

var Signal = (function() {

		/**
		 * Cached regex used to parse event string
		 * @type {RegExp}
		 */
	var _NAME_REGEX = /\w([^:\.])*/g,
		/**
		 * Quick reference to Array.prototype.splice
		 * for duplicating arrays
		 * @type {Function}
		 */
		_splicer = ([]).splice,
		/**
		 * Object merger
		 * @param {Objects}
		 * @return {Object}
		 */
		_extend = function() {
			var args = arguments,
				base = args[0],
				idx = 1, length = args.length,
				key, merger;
			for (; idx < length; idx += 1) {
				merger = args[idx];
				
				for (key in merger) {
					base[key] = merger[key];
				}
			}
		},
		/**
		 * Unique Id
		 * @type {Number}
		 */		
		_subid = 0;

	var Signal = function() {
		/**
		 * Holds cached, parsed event keys by string
		 * @type {Object}
		 */
		this._cache = {};

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
		// this._subscriptions;
	};

	/**
	 * Returns a new Signal instance
	 * @return {Signal}
	 */
	Signal.construct = function() {
		return new Signal();
	};

	/**
	 * Klass extend method
	 * @param  {Function} constructor
	 * @param  {Object} extension   prototype extension
	 * @return {Function} constructor
	 */
	Signal.extend = function(constructor, extension) {
		var hasConstructor = (typeof constructor === 'function');
		if (!hasConstructor) { extension = constructor; }

		var self = this,
			fn = function() {
				var ret = self.apply(this, arguments);
				if (hasConstructor) {
					ret = constructor.apply(this, arguments);
				}
				return ret;
			};

		// Add properties to the object
		_extend(fn, this);

		// Duplicate the prototype
		var NoOp = function() {};
		NoOp.prototype = this.prototype;
		fn.prototype = new NoOp();

		// Merge the prototypes
		_extend(fn.prototype, this.prototype, extension);
		fn.prototype.constructor = constructor || fn;

		return fn;
	};

	Signal.prototype = {

		constructor: Signal,

		subscribe: function(name, func) {
			this._subscriptions = this._subscriptions || {};

			var id = this._uniqueSubId(),
				location = this._subscriptions[name] || (this._subscriptions[name] = []);

			func.__subid__ = id;
			location.push(func);

			return id;
		},

		unsubscribe: function(name, id) {
			this._subscriptions = this._subscriptions || {};
			
			var location = this._subscriptions[name];
			if (!location) { return; }

			var idx = 0, length = location.length;
			for (; idx < length; idx += 1) {
				if (location[idx].__subid__ === id) {
					location.splice(idx, 1);
					return true;
				}
			}

			return false;
		},

		dispatch: function() {
			this._subscriptions = this._subscriptions || {};

			var args = arguments,
				name = _splicer.call(args, 0, 1)[0],
				location = this._subscriptions[name] || (this._subscriptions[name] = []),
				idx = 0, length = location.length,
				func;
			for (; idx < length; idx++) {
				func = location[idx];
				if (func) { func.apply(null, args); }
			}
		},

		/* Disable | Enable *************************************/
		disable: function(handle) {
			this._inactive = this._inactive || {};
			this._inactive[handle] = this._inactive[handle] || {};
			this._inactive[handle] = _extend({}, this._active[handle]);
			delete this._active[handle];

			return this;
		},

		enable: function(handle) {
			this._inactive = this._inactive || {};
			this._active[handle] = this._active[handle] || {};
			this._active[handle] = _extend({}, this._inactive[handle]);
			delete this._inactive[handle];

			return this;
		},

		/* On | Off ************************************************/
		on: function(eventname, callback) {
			var eventConfig, location,
				cacheConfig = this._cache[eventname];
			
			if (cacheConfig) {
				eventConfig = cacheConfig;
				location = this._getEventLocation(eventConfig);
			} else {
				eventConfig = this._cache[eventname] = this._parseConfig(eventname);
				location = this._getEventLocation(eventConfig);
			}

			location.push(callback);

			return this;
		},
		bind: function() { this.on.apply(this, arguments); },
		
		off: function(eventname) {
			var eventConfig,
				cacheConfig = this._cache[eventname];
			
			if (cacheConfig) {
				eventConfig = cacheConfig;
			} else {
				eventConfig = this._cache[eventname] = this._parseConfig(eventname);
			}

			if (eventConfig.hasNamespace) { // Has a namespace
				this._active[eventConfig.handle][eventConfig.evt][eventConfig.namespace].length = 0;
			} else { // Does not have a namespace
				this._active[eventConfig.handle][eventConfig.evt] = { '': [] };
			}

			return this;
		},
		unbind: function() { this.off.apply(this, arguments); },

		once: function(eventname, callback) {
			var hasRan = false, memo;
			
			return this.on(eventname, function() {
				return function() {
					if (hasRan) { return memo; }
					hasRan = true;

					memo = callback.apply(this, arguments);
					callback = null;

					return memo;
				};
			});
		},

		/* Trigger ************************************************/
		trigger: function() {
			var args = arguments,
				eventname = _splicer.call(args, 0, 1)[0],
				cacheConfig = this._cache[eventname];

			if (cacheConfig) {
				eventConfig = cacheConfig;
			} else {
				eventConfig = this._cache[eventname] = this._parseConfig(eventname);
			}

			var location = this._getEventLocation(eventConfig);

			if (eventConfig.hasNamespace) { // If there's a namespace, trigger only that array
				this._callEventArray(location, args);
			} else { // Else, trigger everything registered to the event
				var subSignal = this._active[eventConfig.handle][eventConfig.evt], key;
				for (key in subSignal) {
					this._callEventArray(subSignal[key], args);
				}
			}

			return this;
		},

		/* ListenTo | StopListening ********************************/
		listenTo: function(obj, eventname, callback) {
			obj.on(eventname, callback);
			return this;
		},
		stopListening: function(obj, eventname) {
			obj.off(eventname);
			return this;
		},

		/* Private *************************************************/
		_uniqueSubId: function() {
			return 's' + _subid++;
		},

		_callEventArray: function(events, args) {
			args = args || [];

			var idx = 0, length = events.length,
				evt;
			for (; idx < length; idx += 1) {
				evt = events[idx];
				if (!evt) { continue; }
				if (evt.apply(null, args) === false) { return; }
			}
		},

		_parseConfig: function(eventname) {
			var hasHandle = (eventname.indexOf(':') !== -1) ? true : false,
				hasNamespace = (eventname.indexOf('.') !== -1) ? true : false,
				matches = eventname.match(_NAME_REGEX),
				eventConfig = {};

			if (hasHandle && hasNamespace) { // Has handle, event, namespace
				
				eventConfig.handle = matches[0];
				eventConfig.evt = matches[1];
				eventConfig.namespace = matches[2];

			} else if (hasHandle && !hasNamespace) { // Has handle and event
				
				eventConfig.handle = matches[0];
				eventConfig.evt = matches[1];
				eventConfig.namespace = '';

			} else if (hasNamespace && !hasHandle) { // Has event and namespace
				
				eventConfig.handle = '';
				eventConfig.evt = matches[0];
				eventConfig.namespace = matches[1];

			} else { // Has event
				
				eventConfig.handle = '';
				eventConfig.evt = matches[0];
				eventConfig.namespace = '';

			}

			eventConfig.hasHandle = hasHandle;
			eventConfig.hasNamespace = hasNamespace;

			return eventConfig;
		},

		_getEventLocation: function(eventConfig, location) {
			location = location || this._active;

			var handle = location[eventConfig.handle] || (location[eventConfig.handle] = {}),
				evt = handle[eventConfig.evt] || (handle[eventConfig.evt] = {}),
				namespace = evt[eventConfig.namespace] || (evt[eventConfig.namespace] = []);

			return namespace;
		},

		toString: function() {
			return '[Signal]';
		}
	};

	// Create a pub/sub to expose Signal as
	// e.g. Signal.on(), Signal.trigger()
	var pubSub = new Signal();
	
	// Attach the Signal object as a property
	// of the exposed object so that new instances
	// can be constructed/extended
	// e.g. Signal.core.construct(), Signal.core.extend({})
	pubSub.core = Signal;

	// Expose
	return pubSub;

}());