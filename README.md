## signal

A small (3.78KB minified, 3.6KB gzipped) and fast event system with no dependencies and namespacing. 
Built for performance. Great as a pubsub or to add event emitters to your code.

`npm install signal-js`

## How to use
Bind a function in a jquery-like fashion to signal using `on` or `bind`.
```javascript
var signal = require('signal-js');

signal.on('basic', function(arg) {
	console.log('args: ', arg);
});

// logs "args: 1"
signal.trigger('basic', 1);
```
Define a namespace with a `.`
```javascript
signal.on('ns-event.mine', function(one, two, three) {
	console.log('args: ', one, two, three);
});

// logs "args: 3 2 1"
signal.trigger('ns-event', 3, 2, 1);
```
another example
```javascript
signal.on('example', function(word) {
	console.log('hi ', word);
})
.on('example.bye', function(word) {
	console.log('bye ', word);
});

// logs "hi John", "bye John"
signal.trigger('example', 'John');
// only logs "bye John"
signal.trigger('example.bye', 'John');
```

`once` can also be used.
```javascript
signal.once('bam', function() {
	console.log('Boom!');
});

// logs "Boom!"
signal.trigger('bam')
	// nothing is logged
	.trigger('bam');
```

##### Off:
Use `off` or `unbind` to unbind events.
```javascript
signal.on('example.foo', function() {});

// Unbinds the event
signal.off('example.foo');
// Unbinds all .foo namespaced events
signal.off('.foo');
```

## Disable/Enable
While disabled, a signal wont trigger any
events, but can still be subscribed to.
```javascript
signal.disable();
```

## Create
```javascript
var pubSub = signal();
```

## Support
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/JosephClay/signal-js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

#License

The MIT License (MIT)

Copyright (c) 2014 Joseph Clay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
