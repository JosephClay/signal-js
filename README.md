## signal-js

A small (`2.4KB` minified, `1.07KB` gzipped) and fast event system with `0` dependencies. 
Written in es2020 and built for performance. Great as a pubsub or to add event emitters 
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

let idx = 0;
signal.once('tick', () => idx++);

signal.emit('tick')
// idx = 1

signal.emit('tick');
// idx = 1
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

#### *`.clear(eventName)`*
- Returns: _signal_
Forcefully clears all `listeners` and `eventNames` from the signal at the eventName.
Clears all listeners if no eventName is passed.
