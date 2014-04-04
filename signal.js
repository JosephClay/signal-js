(function(root, undefined) {

		/**
		 * Quick reference to Array.prototype.splice
		 * for duplicating arrays (while removing the 
		 * first parameter)
		 * @type {Function}
		 */
	var _ripFirstArg = (function(splice) {
			return function(arr) {
				return spice.call(arr, 0, 1)[0];
			};
		}([].splice)),
		
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
				handle:    (match[1] === undefined) ? '' : match[1],
				// [2] : event
				evt:       (match[2] === undefined) ? '' : match[2],
				// [3] : namespace
				namespace: (match[3] === undefined) ? '' : match[3]
			};
		},

		_reassignEvents = function(handle, active, inactive) {
			inactive[handle] = inactive[handle] || {};
			inactive[handle] = _extend({}, active[handle]);
			delete active[handle];
		};


	var Signal = function() {
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
	};

	_extend(Signal, {

		/**
		 * Returns a new Signal instance
		 * @return {Signal}
		 */
		construct: function() {
			return new Signal();
		},

		/**
		 * Klass extend method
		 * @param  {Function} constructor
		 * @param  {Object} extension   prototype extension
		 * @return {Function} constructor
		 */
		extend: function(constructor, extension) {
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
		}
	});

	Signal.prototype = {

		constructor: Signal,

		subscribe: function(name, func) {
			var subscriptions = this._subs || (this._subs = {});

			var id = _uniqueId(),
				location = subscriptions[name] || (subscriptions[name] = []);

			func.__subid__ = id;
			location.push(func);

			return id;
		},

		unsubscribe: function(name, id) {
			var subscriptions = this._subs || (this._subs = {});

			var location = subscriptions[name];
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
			
			this._evtLookup(eventConfig).push(callback);

			return this;
		},
		bind: function() { this.on.apply(this, arguments); },

		off: function(eventname) {
			var eventConfig = _cache[eventname] || (_cache[eventname] = _parseConfig(eventname));

			if (eventConfig.evt === '') { // Removing a namespace

				var events = this._active[eventConfig.handle],
					eventName,
					namespaceName;
				for (eventName in events) {
					for (namespaceName in events[eventName]) {
						if (namespaceName === eventConfig.namespace) {
							this._active[eventConfig.handle][eventName][namespaceName].length = 0;
						}
					}
				}

			} else if (eventConfig.namespace !== '') { // Has a namespace
				
				this._active[eventConfig.handle][eventConfig.evt][eventConfig.namespace].length = 0;

			} else { // Does not have a namespace
				
				this._active[eventConfig.handle][eventConfig.evt] = { '': [] };

			}

			return this;
		},
		unbind: function() { this.off.apply(this, arguments); },

		// Based on underscore's once implementation
		once: function(eventname, callback) {
			var hasRan = false,
				memo;
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

		// Trigger ************************************************
		trigger: function() {
			var args = arguments,
				eventname = _ripFirstArg(args),
				eventConfig = _cache[eventname] || (_cache[eventname] = _parseConfig(eventname)),
				location = this._evtLookup(eventConfig);

			if (eventConfig.namespace !== '') { // If there's a namespace, trigger only that array
				
				this._callEvts(location, args);

			} else { // Else, trigger everything registered to the event
				
				var subSignal = this._active[eventConfig.handle][eventConfig.evt],
					key;
				for (key in subSignal) {
					this._callEvts(subSignal[key], args);
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
		},

		// Private *************************************************
		_callEvts: function(events, args) {
			args = args || [];

			var idx = 0, length = events.length,
				evt;
			for (; idx < length; idx += 1) {
				evt = events[idx];
				if (!evt) { continue; }
				if (evt.apply(null, args) === false) { return; }
			}
		},

		_evtLookup: function(eventConfig, location) {
			location = location || this._active;

			var handle    = location[eventConfig.handle] || (location[eventConfig.handle] = {}),
				evt       = handle[eventConfig.evt]      || (handle[eventConfig.evt]      = {}),
				namespace = evt[eventConfig.namespace]   || (evt[eventConfig.namespace]   = []);

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
	root.Signal = pubSub;

}(this));