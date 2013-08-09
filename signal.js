// Signal.js 0.0.1
// Signal may be freely distributed under the MIT license.

var Signal = (function() {

	var _NAME_REGEX = /\w([^:\.])*/g;

	var Events = function() {
		this.reset();
	};
	
	Events.construct = function() {
		return new Events();
	};

	Events.prototype = {

		reset: function() {
			this._active = {};
			this._inactive = {};
			this._subid = 0;
			this._subscriptions = {};
			return this;
		},

		subscribe: function(name, func) {
			var id = this._uniqueSubId(),
				location = this._subscriptions[name] || (this._subscriptions[name] = []);

			func.__subid__ = id;
			location.push(func);

			return id;
		},

		unsubscribe: function(name, id) {
			var location = this._subscriptions[name];
			if (!location) { return; }

			var idx = 0, length = location.length;
			for (; idx < length; idx++) {
				if (location[idx].__subid__ === id) {
					location.splice(idx, 1);
					return true;
				}
			}

			return false;
		},

		dispatch: function() {
			var args = _.toArray(arguments),
				name = args.splice(0, 1)[0],
				location = this._subscriptions[name],
				idx = 0, length = location.length;
			for (; idx < length; idx++) {
				location[idx].apply(null, args);
			}
		},

		/* Create | Clear | Revert *************************************/
		create: function(handle, events) {
			var key, eventConfig;
			for (key in events) {
				eventConfig = this._getEventConfig(handle + ':' + key);
				this._createEventLocation(eventConfig, this._active);
				this._active[eventConfig.handle][eventConfig.evt][eventConfig.namespace] = events[key];
			}

			return this;
		},

		disable: function(handle) {
			this._inactive[handle] = this._inactive[handle] || {};
			this._inactive[handle] = _.extend({}, this._active[handle]);
			delete this._active[handle];

			return this;
		},

		enable: function(handle) {
			this._active[handle] = this._active[handle] || {};
			this._active[handle] = _.extend({}, this._inactive[handle]);
			delete this._inactive[handle];

			return this;
		},

		/* On | Off ************************************************/
		on: function(eventname, callback) {
			var eventConfig = this._getEventConfig(eventname),
				location = this._createEventLocation(eventConfig);
			location.push(callback);

			return this;
		},
		off: function(eventname) {
			var eventConfig = this._getEventConfig(eventname);
			if (eventConfig.hasNamespace) { // Has a namespace
				this._active[eventConfig.handle][eventConfig.evt][eventConfig.namespace] = [];
			} else { // Does not have a namespace
				this._active[eventConfig.handle][eventConfig.evt] = { '': [] };
			}

			return this;
		},
		once: function(eventname, callback) {
			return this.on(eventname, _.once(callback));
		},

		/* Trigger ************************************************/
		trigger: function() {
			var args = _.toArray(arguments),
				eventname = args.splice(0, 1)[0],
				eventConfig = this._getEventConfig(eventname),
				location = this._getEventLocation(eventConfig);

			if (!location) { return this; }

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
			this._listenCheck(obj);
			obj.on(eventname, callback);

			return this;
		},
		stopListening: function(obj, eventname) {
			this._listenCheck(obj);
			obj.off(eventname);

			return this;
		},
		_listenCheck: function(obj) {
			if (!obj || !obj.on || !obj.off) {
				throw new Error('Object cannot be listened to: '+ obj);
			}
		},

		/* Private *************************************************/
		_uniqueSubId: function() {
			return 's' + this._subid++;
		},

		_getEvent: function(eventname) {
			// Ensure the location exists and return the event
			return this._createEventLocation(this._getEventConfig(eventname));
		},

		_callEventArray: function(events, args) {
			args = args || [];

			var idx = 0, length = events.length,
				blankFunc = function() {},
				evt;
			for (; idx < length; idx++) {
				evt = events[idx];
				if (!evt) { continue; }
				if (evt.apply(null, args) === false) { return; }
			}
		},

		_getEventConfig: function(eventname) {
			var hasHandle = (eventname.indexOf(':') !== -1) ? true : false,
				hasNamespace = (eventname.indexOf('.') !== -1) ? true : false,
				matches = eventname.match(_NAME_REGEX),
				eventConfig = {};

			if (hasHandle && hasNamespace) { // Has handle, event, namespace
				eventConfig = { handle: matches[0], evt: matches[1], namespace: matches[2] };
			} else if (hasHandle && !hasNamespace) { // Has handle and event
				eventConfig = { handle: matches[0], evt: matches[1], namespace: '' };
			} else if (hasNamespace && !hasHandle) { // Has event and namespace
				eventConfig = { handle: '', evt: matches[0], namespace: matches[1] };
			} else { // Has event
				eventConfig = { handle: '', evt: matches[0], namespace: '' };
			}

			eventConfig.hasHandle = hasHandle;
			eventConfig.hasNamespace = hasNamespace;

			return eventConfig;
		},

		_getEventLocation: function(eventConfig, location) {
			location = location || this._active;

			var handle = location[eventConfig.handle];
			if (!handle) { return; }

			var evts = handle[eventConfig.evt];
			if (!evts) { return; }

			if (!eventConfig.hasNamespace) { return evts; }

			var namespace = evts[eventConfig.namespace];
			if (!namespace) { return; }

			// Return the location
			return namespace;
		},

		_createEventLocation: function(eventConfig, location) {
			location = location || this._active;

			var handle = location[eventConfig.handle] || (location[eventConfig.handle] = {}),
				evt = handle[eventConfig.evt] || (handle[eventConfig.evt] = {}),
				namespace = evt[eventConfig.namespace] || (evt[eventConfig.namespace] = []);

			return namespace;
		},

		toString: function() {
			return '[ Signal ]';
		}
	};

	return new Events();

}());