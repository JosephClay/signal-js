// Signal.js 0.0.1
// Signal may be freely distributed under the MIT license.
var Signal=function(){var a=/\w([^:\.])*/g,b="signal",c=[].splice,d=function(){for(var e,f,a=arguments,b=a[0],c=1,d=a.length;d>c;c+=1){f=a[c];for(e in f)b[e]=f[e]}},e=function(){this._cache={},this._active={},this._inactive={},this._subid=0,this._subscriptions={}};return e.construct=function(){return new e},e.prototype={subscribe:function(a,c){var d=this._uniqueSubId(b),e=this._subscriptions[a]||(this._subscriptions[a]=[]);return c.__subid__=d,e.push(c),d},unsubscribe:function(a,b){var c=this._subscriptions[a];if(c){for(var d=0,e=c.length;e>d;d+=1)if(c[d].__subid__===b)return c.splice(d,1),!0;return!1}},dispatch:function(){for(var g,a=arguments,b=c.call(a,0,1)[0],d=this._subscriptions[b]||(this._subscriptions[b]=[]),e=0,f=d.length;f>e;e++)g=d[e],g&&g.apply(null,a)},disable:function(a){return this._inactive[a]=this._inactive[a]||{},this._inactive[a]=d({},this._active[a]),delete this._active[a],this},enable:function(a){return this._active[a]=this._active[a]||{},this._active[a]=d({},this._inactive[a]),delete this._inactive[a],this},on:function(a,b){var c,d,e=this._cache[a];return e?(c=e,d=this._getEventLocation(c)):(c=this._cache[a]=this._parseConfig(a),d=this._createEventLocation(c)),d.push(b),this},off:function(a){var b,c=this._cache[a];return b=c?c:this._cache[a]=this._parseConfig(a),b.hasNamespace?this._active[b.handle][b.evt][b.namespace].length=0:this._active[b.handle][b.evt]={"":[]},this},once:function(a,b){var d,c=!1;return this.on(a,function(){return function(){return c?d:(c=!0,d=b.apply(this,arguments),b=null,d)}})},trigger:function(){var a=arguments,b=c.call(a,0,1)[0],d=this._cache[b];eventConfig=d?d:this._cache[b]=this._parseConfig(b);var e=this._getEventLocation(eventConfig);if(!e)return this;if(eventConfig.hasNamespace)this._callEventArray(e,a);else{var g,f=this._active[eventConfig.handle][eventConfig.evt];for(g in f)this._callEventArray(f[g],a)}return this},listenTo:function(a,b,c){return a.on(b,c),this},stopListening:function(a,b){return a.off(b),this},_uniqueSubId:function(){return"s"+this._subid++},_callEventArray:function(a,b){b=b||[];for(var e,c=0,d=a.length;d>c;c+=1)if(e=a[c],e&&e.apply(null,b)===!1)return},_parseConfig:function(b){var c=-1!==b.indexOf(":")?!0:!1,d=-1!==b.indexOf(".")?!0:!1,e=b.match(a),f={};return c&&d?(f.handle=e[0],f.evt=e[1],f.namespace=e[2]):c&&!d?(f.handle=e[0],f.evt=e[1],f.namespace=""):d&&!c?(f.handle="",f.evt=e[0],f.namespace=e[1]):(f.handle="",f.evt=e[0],f.namespace=""),f.hasHandle=c,f.hasNamespace=d,f},_getEventLocation:function(a,b){b=b||this._active;var c=b[a.handle];if(c){var d=c[a.evt];if(d){if(!a.hasNamespace)return d;var e=d[a.namespace];if(e)return e}}},_createEventLocation:function(a,b){b=b||this._active;var c=b[a.handle]||(b[a.handle]={}),d=c[a.evt]||(c[a.evt]={}),e=d[a.namespace]||(d[a.namespace]=[]);return e},toString:function(){return"[Signal]"}},new e}();