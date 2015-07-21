(function () {
'use strict';
var common = require('../common');
var assert = require('assert');
var events = require('../lib/events');

var e = new events.EventEmitter();

var events_new_listener_emited = [];
var listeners_new_listener_emited = [];
var times_hello_emited = 0;

// sanity check
assert.equal(e.addListener, e.on);

e.on('newListener', function(event, listener) {
  if (event === 'newListener')
    return; // Don't track our adding of newListener listeners.
  console.log('newListener: ' + event);
  events_new_listener_emited.push(event);
  listeners_new_listener_emited.push(listener);
});

function hello(a, b) {
  console.log('hello');
  times_hello_emited += 1;
  assert.equal('a', a);
  assert.equal('b', b);
}
e.once('newListener', function(name, listener) {
  assert.equal(name, 'hello');
  assert.equal(listener, hello);
  assert.deepEqual(this.listeners('hello'), []);
});
e.on('hello', hello);

var foo = function() {};
e.once('foo', foo);

console.log('start');

e.emit('hello', 'a', 'b');


// just make sure that this doesn't throw:
var f = new events.EventEmitter();
f.setMaxListeners(0);


process.on('exit', function() {
  assert.deepEqual(['hello', 'foo'], events_new_listener_emited);
  assert.deepEqual([hello, foo], listeners_new_listener_emited);
  assert.equal(1, times_hello_emited);
});

var listen1 = function listen1() {};
var listen2 = function listen2() {};
var e1 = new events.EventEmitter();
e1.once('newListener', function() {
  assert.deepEqual(e1.listeners('hello'), []);
  e1.once('newListener', function() {
    assert.deepEqual(e1.listeners('hello'), []);
  });
  e1.on('hello', listen2);
});
e1.on('hello', listen1);
// The order of listeners on an event is not always the order in which the
// listeners were added.
assert.deepEqual(e1.listeners('hello'), [listen2, listen1]);

})();
(function () {
'use strict';
var common = require('../common');
var assert = require('assert');
var events = require('../lib/events');

var e = new events.EventEmitter();

// default
for (var i = 0; i < 10; i++) {
  e.on('default', function() {});
}
assert.ok(!e._events['default'].hasOwnProperty('warned'));
e.on('default', function() {});
assert.ok(e._events['default'].warned);

// specific
e.setMaxListeners(5);
for (var i = 0; i < 5; i++) {
  e.on('specific', function() {});
}
assert.ok(!e._events['specific'].hasOwnProperty('warned'));
e.on('specific', function() {});
assert.ok(e._events['specific'].warned);

// only one
e.setMaxListeners(1);
e.on('only one', function() {});
assert.ok(!e._events['only one'].hasOwnProperty('warned'));
e.on('only one', function() {});
assert.ok(e._events['only one'].hasOwnProperty('warned'));

// unlimited
e.setMaxListeners(0);
for (var i = 0; i < 1000; i++) {
  e.on('unlimited', function() {});
}
assert.ok(!e._events['unlimited'].hasOwnProperty('warned'));

// process-wide
events.EventEmitter.defaultMaxListeners = 42;
e = new events.EventEmitter();

for (var i = 0; i < 42; ++i) {
  e.on('fortytwo', function() {});
}
assert.ok(!e._events['fortytwo'].hasOwnProperty('warned'));
e.on('fortytwo', function() {});
assert.ok(e._events['fortytwo'].hasOwnProperty('warned'));
delete e._events['fortytwo'].warned;

events.EventEmitter.defaultMaxListeners = 44;
e.on('fortytwo', function() {});
assert.ok(!e._events['fortytwo'].hasOwnProperty('warned'));
e.on('fortytwo', function() {});
assert.ok(e._events['fortytwo'].hasOwnProperty('warned'));

// but _maxListeners still has precedence over defaultMaxListeners
events.EventEmitter.defaultMaxListeners = 42;
e = new events.EventEmitter();
e.setMaxListeners(1);
e.on('uno', function() {});
assert.ok(!e._events['uno'].hasOwnProperty('warned'));
e.on('uno', function() {});
assert.ok(e._events['uno'].hasOwnProperty('warned'));

// chainable
assert.strictEqual(e, e.setMaxListeners(1));

})();
(function () {
'use strict';
var EventEmitter = require('../lib/events');
var assert = require('assert');

var EE = new EventEmitter();

assert.throws(function() {
  EE.emit('error', 'Accepts a string');
}, /Accepts a string/);

})();
(function () {
'use strict';
var common = require('../common');
var assert = require('assert');
var EventEmitter = require('../lib/events');

var emitter = new EventEmitter();

assert.strictEqual(emitter.getMaxListeners(), EventEmitter.defaultMaxListeners);

emitter.setMaxListeners(0);
assert.strictEqual(emitter.getMaxListeners(), 0);

emitter.setMaxListeners(3);
assert.strictEqual(emitter.getMaxListeners(), 3);

// https://github.com/nodejs/io.js/issues/523 - second call should not throw.
var recv = {};
EventEmitter.prototype.on.call(recv, 'event', function() {});
EventEmitter.prototype.on.call(recv, 'event', function() {});

})();
(function () {
'use strict';

var common = require('../common');
var assert = require('assert');
var events = require('../lib/events');

var EventEmitter = require('events').EventEmitter;
var assert = require('assert');

var e = new EventEmitter();
var fl;  // foo listeners

fl = e.listeners('foo');
assert(Array.isArray(fl));
assert(fl.length === 0);
assert.deepEqual(e._events, {});

e.on('foo', assert.fail);
fl = e.listeners('foo');
assert(e._events.foo === assert.fail);
assert(Array.isArray(fl));
assert(fl.length === 1);
assert(fl[0] === assert.fail);

e.listeners('bar');
assert(!e._events.hasOwnProperty('bar'));

e.on('foo', assert.ok);
fl = e.listeners('foo');

assert(Array.isArray(e._events.foo));
assert(e._events.foo.length === 2);
assert(e._events.foo[0] === assert.fail);
assert(e._events.foo[1] === assert.ok);

assert(Array.isArray(fl));
assert(fl.length === 2);
assert(fl[0] === assert.fail);
assert(fl[1] === assert.ok);

console.log('ok');

})();
(function () {
'use strict';

var common = require('../common');
var assert = require('assert');
var events = require('../lib/events');

function listener() {}
function listener2() {}

var e1 = new events.EventEmitter();
e1.on('foo', listener);
var fooListeners = e1.listeners('foo');
assert.deepEqual(e1.listeners('foo'), [listener]);
e1.removeAllListeners('foo');
assert.deepEqual(e1.listeners('foo'), []);
assert.deepEqual(fooListeners, [listener]);

var e2 = new events.EventEmitter();
e2.on('foo', listener);
var e2ListenersCopy = e2.listeners('foo');
assert.deepEqual(e2ListenersCopy, [listener]);
assert.deepEqual(e2.listeners('foo'), [listener]);
e2ListenersCopy.push(listener2);
assert.deepEqual(e2.listeners('foo'), [listener]);
assert.deepEqual(e2ListenersCopy, [listener, listener2]);

var e3 = new events.EventEmitter();
e3.on('foo', listener);
var e3ListenersCopy = e3.listeners('foo');
e3.on('foo', listener2);
assert.deepEqual(e3.listeners('foo'), [listener, listener2]);
assert.deepEqual(e3ListenersCopy, [listener]);

})();
(function () {
'use strict';
var common = require('../common');
var assert = require('assert');
var events = require('../lib/events');

var gotEvent = false;

process.on('exit', function() {
  assert(gotEvent);
});

var e = new events.EventEmitter();

e.on('maxListeners', function() {
  gotEvent = true;
});

// Should not corrupt the 'maxListeners' queue.
e.setMaxListeners(42);

assert.throws(function() {
  e.setMaxListeners(NaN);
});

assert.throws(function() {
  e.setMaxListeners(-1);
});

assert.throws(function() {
  e.setMaxListeners('and even this');
});

e.emit('maxListeners');

})();
(function () {
'use strict';
var common = require('../common');
var assert = require('assert');
var events = require('../lib/events');

var E = events.EventEmitter.prototype;
assert.equal(E.constructor.name, 'EventEmitter');
assert.equal(E.on, E.addListener);  // Same method.
Object.getOwnPropertyNames(E).forEach(function(name) {
  if (name === 'constructor' || name === 'on') return;
  if (typeof E[name] !== 'function') return;
  assert.equal(E[name].name, name);
});

})();
(function () {
'use strict';
var common = require('../common');
var assert = require('assert');
var events = require('../lib/events');

var callbacks_called = [];

var e = new events.EventEmitter();

function callback1() {
  callbacks_called.push('callback1');
  e.on('foo', callback2);
  e.on('foo', callback3);
  e.removeListener('foo', callback1);
}

function callback2() {
  callbacks_called.push('callback2');
  e.removeListener('foo', callback2);
}

function callback3() {
  callbacks_called.push('callback3');
  e.removeListener('foo', callback3);
}

e.on('foo', callback1);
assert.equal(1, e.listeners('foo').length);

e.emit('foo');
assert.equal(2, e.listeners('foo').length);
assert.deepEqual(['callback1'], callbacks_called);

e.emit('foo');
assert.equal(0, e.listeners('foo').length);
assert.deepEqual(['callback1', 'callback2', 'callback3'], callbacks_called);

e.emit('foo');
assert.equal(0, e.listeners('foo').length);
assert.deepEqual(['callback1', 'callback2', 'callback3'], callbacks_called);

e.on('foo', callback1);
e.on('foo', callback2);
assert.equal(2, e.listeners('foo').length);
e.removeAllListeners('foo');
assert.equal(0, e.listeners('foo').length);

// Verify that removing callbacks while in emit allows emits to propagate to
// all listeners
callbacks_called = [];

e.on('foo', callback2);
e.on('foo', callback3);
assert.equal(2, e.listeners('foo').length);
e.emit('foo');
assert.deepEqual(['callback2', 'callback3'], callbacks_called);
assert.equal(0, e.listeners('foo').length);

})();
(function () {
'use strict';
var common = require('../common');
var assert = require('assert');
var events = require('../lib/events');
var domain = require('domain');

var errorCatched = false;

var e = new events.EventEmitter();

var d = domain.create();
d.add(e);
d.on('error', function(er) {
  assert(er instanceof Error, 'error created');
  errorCatched = true;
});

e.emit('error');

process.on('exit', function() {
  assert(errorCatched, 'error got caught');
});

})();
(function () {
'use strict';
var common = require('../common');
var assert = require('assert');
var events = require('../lib/events');

var e = new events.EventEmitter(),
    num_args_emited = [];

e.on('numArgs', function() {
  var numArgs = arguments.length;
  console.log('numArgs: ' + numArgs);
  num_args_emited.push(numArgs);
});

console.log('start');

e.emit('numArgs');
e.emit('numArgs', null);
e.emit('numArgs', null, null);
e.emit('numArgs', null, null, null);
e.emit('numArgs', null, null, null, null);
e.emit('numArgs', null, null, null, null, null);

process.on('exit', function() {
  assert.deepEqual([0, 1, 2, 3, 4, 5], num_args_emited);
});

})();
(function () {
'use strict';
var common = require('../common');
var assert = require('assert');
var events = require('../lib/events');

var e = new events.EventEmitter();
var times_hello_emited = 0;

e.once('hello', function(a, b) {
  times_hello_emited++;
});

e.emit('hello', 'a', 'b');
e.emit('hello', 'a', 'b');
e.emit('hello', 'a', 'b');
e.emit('hello', 'a', 'b');

var remove = function() {
  assert.fail(1, 0, 'once->foo should not be emitted', '!');
};

e.once('foo', remove);
e.removeListener('foo', remove);
e.emit('foo');

process.on('exit', function() {
  assert.equal(1, times_hello_emited);
});

var times_recurse_emitted = 0;

e.once('e', function() {
  e.emit('e');
  times_recurse_emitted++;
});

e.once('e', function() {
  times_recurse_emitted++;
});

e.emit('e');

process.on('exit', function() {
  assert.equal(2, times_recurse_emitted);
});

})();
(function () {
'use strict';
var common = require('../common');
var assert = require('assert');
var events = require('../lib/events');


function expect(expected) {
  var actual = [];
  process.on('exit', function() {
    assert.deepEqual(actual.sort(), expected.sort());
  });
  function listener(name) {
    actual.push(name);
  }
  return common.mustCall(listener, expected.length);
}

function listener() {}

var e1 = new events.EventEmitter();
e1.on('foo', listener);
e1.on('bar', listener);
e1.on('baz', listener);
e1.on('baz', listener);
var fooListeners = e1.listeners('foo');
var barListeners = e1.listeners('bar');
var bazListeners = e1.listeners('baz');
e1.on('removeListener', expect(['bar', 'baz', 'baz']));
e1.removeAllListeners('bar');
e1.removeAllListeners('baz');
assert.deepEqual(e1.listeners('foo'), [listener]);
assert.deepEqual(e1.listeners('bar'), []);
assert.deepEqual(e1.listeners('baz'), []);
// after calling removeAllListeners,
// the old listeners array should stay unchanged
assert.deepEqual(fooListeners, [listener]);
assert.deepEqual(barListeners, [listener]);
assert.deepEqual(bazListeners, [listener, listener]);
// after calling removeAllListeners,
// new listeners arrays are different from the old
assert.notEqual(e1.listeners('bar'), barListeners);
assert.notEqual(e1.listeners('baz'), bazListeners);

var e2 = new events.EventEmitter();
e2.on('foo', listener);
e2.on('bar', listener);
// expect LIFO order
e2.on('removeListener', expect(['foo', 'bar', 'removeListener']));
e2.on('removeListener', expect(['foo', 'bar']));
e2.removeAllListeners();
console.error(e2);
assert.deepEqual([], e2.listeners('foo'));
assert.deepEqual([], e2.listeners('bar'));

var e3 = new events.EventEmitter();
e3.on('removeListener', listener);
// check for regression where removeAllListeners throws when
// there exists a removeListener listener, but there exists
// no listeners for the provided event type
assert.doesNotThrow(e3.removeAllListeners.bind(e3, 'foo'));

var e4 = new events.EventEmitter();
var expectLength = 2;
e4.on('removeListener', function(name, listener) {
  assert.equal(expectLength--, this.listeners('baz').length);
});
e4.on('baz', function() {});
e4.on('baz', function() {});
e4.on('baz', function() {});
assert.equal(e4.listeners('baz').length, expectLength + 1);
e4.removeAllListeners('baz');
assert.equal(e4.listeners('baz').length, 0);

})();
(function () {
'use strict';
var common = require('../common');
var assert = require('assert');
var events = require('../lib/events');

var count = 0;

function listener1() {
  console.log('listener1');
  count++;
}

function listener2() {
  console.log('listener2');
  count++;
}

function listener3() {
  console.log('listener3');
  count++;
}

function remove1() {
  assert(0);
}

function remove2() {
  assert(0);
}

var e1 = new events.EventEmitter();
e1.on('hello', listener1);
e1.on('removeListener', common.mustCall(function(name, cb) {
  assert.equal(name, 'hello');
  assert.equal(cb, listener1);
}));
e1.removeListener('hello', listener1);
assert.deepEqual([], e1.listeners('hello'));

var e2 = new events.EventEmitter();
e2.on('hello', listener1);
e2.on('removeListener', assert.fail);
e2.removeListener('hello', listener2);
assert.deepEqual([listener1], e2.listeners('hello'));

var e3 = new events.EventEmitter();
e3.on('hello', listener1);
e3.on('hello', listener2);
e3.once('removeListener', common.mustCall(function(name, cb) {
  assert.equal(name, 'hello');
  assert.equal(cb, listener1);
  assert.deepEqual([listener2], e3.listeners('hello'));
}));
e3.removeListener('hello', listener1);
assert.deepEqual([listener2], e3.listeners('hello'));
e3.once('removeListener', common.mustCall(function(name, cb) {
  assert.equal(name, 'hello');
  assert.equal(cb, listener2);
  assert.deepEqual([], e3.listeners('hello'));
}));
e3.removeListener('hello', listener2);
assert.deepEqual([], e3.listeners('hello'));

var e4 = new events.EventEmitter();
e4.on('removeListener', common.mustCall(function(name, cb) {
  if (cb !== remove1) return;
  this.removeListener('quux', remove2);
  this.emit('quux');
}, 2));
e4.on('quux', remove1);
e4.on('quux', remove2);
e4.removeListener('quux', remove1);

var e5 = new events.EventEmitter();
e5.on('hello', listener1);
e5.on('hello', listener2);
e5.once('removeListener', common.mustCall(function(name, cb) {
  assert.equal(name, 'hello');
  assert.equal(cb, listener1);
  assert.deepEqual([listener2], e5.listeners('hello'));
  e5.once('removeListener', common.mustCall(function(name, cb) {
    assert.equal(name, 'hello');
    assert.equal(cb, listener2);
    assert.deepEqual([], e5.listeners('hello'));
  }));
  e5.removeListener('hello', listener2);
  assert.deepEqual([], e5.listeners('hello'));
}));
e5.removeListener('hello', listener1);
assert.deepEqual([], e5.listeners('hello'));

})();
(function () {
'use strict';
var common = require('../common');
var assert = require('assert');
var events = require('../lib/events');

var e = new events.EventEmitter();

assert.deepEqual(e._events, {});
e.setMaxListeners(5);
assert.deepEqual(e._events, {});

})();
(function () {
'use strict';
var common = require('../common');
var assert = require('assert');
var EventEmitter = require('../lib/events').EventEmitter;
var util = require('util');

util.inherits(MyEE, EventEmitter);

function MyEE(cb) {
  this.once(1, cb);
  this.emit(1);
  this.removeAllListeners();
  EventEmitter.call(this);
}

var called = false;
var myee = new MyEE(function() {
  called = true;
});


util.inherits(ErrorEE, EventEmitter);
function ErrorEE() {
  this.emit('error', new Error('blerg'));
}

assert.throws(function() {
  new ErrorEE();
}, /blerg/);

process.on('exit', function() {
  assert(called);
  assert.deepEqual(myee._events, {});
  console.log('ok');
});


function MyEE2() {
  EventEmitter.call(this);
}

MyEE2.prototype = new EventEmitter();

var ee1 = new MyEE2();
var ee2 = new MyEE2();

ee1.on('x', function() {});

assert.equal(EventEmitter.listenerCount(ee2, 'x'), 0);

})();
