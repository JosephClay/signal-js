     ____                                  ___                       
    /\  _`\   __                          /\_ \         __           
    \ \,\L\_\/\_\     __     ___      __  \//\ \       /\_\    ____  
     \/_\__ \\/\ \  /'_ `\ /' _ `\  /'__`\  \ \ \      \/\ \  /',__\ 
       /\ \L\ \ \ \/\ \L\ \/\ \/\ \/\ \L\.\_ \_\ \_  __ \ \ \/\__, `\
       \ `\____\ \_\ \____ \ \_\ \_\ \__/.\_\/\____\/\_\_\ \ \/\____/
        \/_____/\/_/\/___L\ \/_/\/_/\/__/\/_/\/____/\/_/\ \_\ \/___/ 
                      /\____/                          \ \____/      
                      \_/__/                            \/___/  

A small (~1KB Minified and GZipped) and fast JavaScript event system. Great as a pubsub or to add event emitters to your code.

## How to use
Bind a function in a jquery-like fashion to Singal using `on` or `bind`. 
```javascript
Signal.on('basic', function(arg) {
	console.log('args: ', arg);
});

// logs "args: 1"
Signal.trigger('basic', 1);
```
Define a namespace with a `.`
```javascript
Signal.on('ns-event.mine', function(one, two, three) {
	console.log('args: ', one, two, three);
});

// logs "args: 3 2 1"
Signal.trigger('ns-event', 3, 2, 1);
```
another example
```javascript
Signal.on('example', function(word) {
	console.log('hi ', word);
})
.on('example.bye', function(word) {
	console.log('bye ', word);
});

// logs "hi John", "bye John"
Signal.trigger('example', 'John');
// only logs "bye John"
Signal.trigger('example.bye', 'John');
```

`once` can also be used.
```javascript
Signal.once('bam', function() {
	console.log('Boom!');
});

// logs "Boom!"
Signal.trigger('bam')
	// nothing is logged
	.trigger('bam');
```

##### Off:
Use `off` or `unbind` to unbind events.
```javascript
Signal.on('example.foo', function() {});

// Unbinds the event
Signal.off('example.foo');
// Unbinds all .foo namespaced events
Signal.off('.foo');
```

## Handles
Handles define another level of scope to events. The scope of the handle protects them from collission of other events (or even namespaces). Define a handle with a `:`.
```javascript
// "change:" is the handle for the event "name"
Signal.on('change:name', function(name) {
	console.log('name changed to: ', name);
});

// This event is in a different scope...
Signal.on('name', function(name) {
	console.log('hi ', name);
});

// ...so that when we trigger it, we don't trigger
// the event with the handle. This logs "hi Bill".
Signal.trigger('name', 'Bill');

// logs "name changed to: David"
Signal.trigger('change:name', 'David');
```

Scoped handles also protect against the unbinding of events.
```javascript
Signal.on('change:title.ns', function() {});
Signal.on('title.ns', function() {});

// Unbinds "title.ns" but not "change:title",
// even though "change:title" has the same namespace
// it is in a different scope
Signal.off('.ns');

// Now all events under the "change" handle with 
// the "ns" namespace are unbound
Signal.off('change:.ns');
```

Handles can also be activated and deactivated. Useful for persistent modules that need to be enabled and disabled. Instead of the overhead of unbinding and rebinding, the handle can be toggled.
```javascript
// "click" handle that we probably don't want to
// have fired when our module is hidden...
Signal.on('click:button', function() {
	console.log('click!');
});

// ...so we'll disable it
Signal.disable('click');

// This doesn't log anything cause the
// handle has been disabled
Signal.trigger('click:button');

// Enable the handle and now we can trigger
// the event. Logs "click!"
Signal.enable('click').trigger('click:button');
```

## Dispatch
For events that need to be even faster, use `subscribe` and `dispatch`. There are no handles or namespaces. `subscribe` will return an id for the subscription that will have to be passed to `unsubscribe` to unbind the event.
```javascript
// Subscribe to the tick event...which will be triggered 60 times a second
var id = Signal.subscribe('tick', function(time) { console.log('tick'); });

// Dispatch the event
Signal.dispatch('tick', Date.now());

// To unsubscribe, pass the event and the id
Signal.unsubscribe('tick', id);
```

## Construct

## Extend
`Signal` comes with a klass-like `extend` method.