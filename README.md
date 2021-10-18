## signal-js

A small (`3.9KB` minified, `1.5KB` gzipped) and fast event system with no dependencies. 
Written in es6 and built for performance. Great as a pubsub or to add event emitters 
to your code.

## Installation

`npm install signal-js`

## How to use

Add a function to signal using `on` and trigger the function using `emit`

```js
import signal from 'signal-js';

signal.on('basic', arg => console.log(arg);

signal.emit('basic', 1);
// > 1
```

Add multiple functions to the same event name

```js
import signal from 'signal-js';

signal.on('multiple', () => console.log(1));
signal.on('multiple', () => console.log(2));
signal.on('multiple', () => console.log(3));

signal.trigger('multiple');
// > 1
// > 2
// > 3
```

Pass as many parameters as you need

```js
import signal from 'signal-js';

signal.on('params', (one, two, three) => console.log(one, two, three));

signal.emit('params', 1, 2, 3);
// > 1 2 3
```

Remove events using `off`

```js
import signal from 'signal-js';

signal.on('test', () => console.log('hi'))
  .off('test') // removes all `test` events
  .emit('test'); // nothing happens
```

`once` can also be used

```js
import signal from 'signal-js';

signal.once('bam', function() {
  console.log('Boom!');
});

signal.emit('bam')
// > "Boom!"

signal.emit('bam');
// nothing is logged
```

The exposed signal is a singleton, but other instances can also be created:

```js
import signal from 'signal-js';

signal.on('foo', () => console.log('global'));

const local = signal();
local.on('foo', () => console.log('local'));

const local2 = local();
local2.on('foo', () => console.log('local2'));

signal.emit('foo');
// > "global"

local.emit('foo');
// > "local"

local2.emit('foo');
// > "local2"
```

# API

#### *`.on(eventName, listener)`*
- `eventName` _string_ The name of the event
- `listener` _Function_ The event handler
- Returns: _signal_

_Alias:_ `addListener`, `subscribe`, `bind`

#### *`.off(eventName, listener)`*
- `eventName` _string_ The name of the event
- `listener` _Function_ (optional) The event handler
- Returns: _signal_

If `listener` is passed, the specific listener will be unbound, 
otherwise all listeners under `eventName` will be unbound.

_Alias:_ `removeListener`, `unsubscribe`, `unbind`

#### *`.emit(eventName, [...parameters])`*
- `eventName` _string_ The name of the event
- `parameters` _any_ (optional) The arguments passed to the listener
- Returns: _signal_

_Alias:_ `dispatch`, `trigger`

#### *`.once(eventName, listener)`*
- `eventName` _string_ The name of the event
- `parameters` _any_ The event handler
- Returns: _signal_

Adds a one-time `listener` that will remove itself after being invoked.

#### *`.listeners(eventName)`*
- `eventName` _string_ The name of the event
- Returns: _Array_

Retrieves registered `listeners` under the `eventName`. If no `eventName` 
is passed, returns all `listeners`.

#### *`.keys()`*
- Returns: _Array_

Retrieves all `eventNames`.

#### *`.size(eventName)`*
- `eventName` _string_ The name of the event
- Returns: _Number_

Returns the quantity of `listeners` at the given `eventName`. If no `eventName` 
is passed, returns the quantity of all `listeners`.

#### *`.disable()`*
- Returns: _signal_

Disables the signal. All methods can still be accessed and called. Any calls 
to `emit` will be ignored.

#### *`.enable()`*
- Returns: _signal_
Enables the signal.

#### *`.clear()`*
- Returns: _signal_
Removes all `listeners` and `eventNames` from the signal.

# License

The MIT License (MIT)

Copyright (c) 2019 Joseph Clay

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
