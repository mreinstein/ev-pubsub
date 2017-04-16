# ev-pubsub

another publish/subscribe module.

npm is flooded with similar modules but I couldn't find any that satisfy all of these criteria:

* doesn't generate memory garbage
* favors factory pattern over terrible javascript classes
* events published in next event loop tick
* works across javascript environments
* simple (< 100 lines of code)

so, here we are.


## basic usage

```javascript
const pubsub = require('ev-pubsub')


const a = pubsub()

a.subscribe('red-light', function(arg1, arg2, arg3) {
  console.log('hello from 1:', arg1)
})

a.subscribe('red-light', function(arg1, arg2, arg3) {
  console.log('hello from 2:', arg1)
})

// all arguments after the first will be sent to subscribers
a.publish('red-light', 'val a', 'val b', 'val c')

/*
prints:

hello from 1: val a
hello from 2: val b
*/
```


## event loop considerations
many of the pubsub implementations out there is they immediately invoke published events.

A problem with this approach is you might end up missing events if they happen before subscribing to them.

`ev-pubsub` gets around this by invoking published events in the next event tick.

```javascript
const pubsub = require('ev-pubsub')


function myFunc(a) {
  console.log('test', a)
}


const mine = pubsub()
mine.publish('some-event', 'omg it happened!')

mine.subscribe('some-event', function(msg) {
  console.log('event message:', msg)
})

/*
prints:

event message: omg it happened!
*/
```

In some libraries you might expect this to print nothing, because you didnt subscribe to the
`some-event` event until after it was published to. Because this library publishes events on the
next tick, you'll be able to set up subscribers without worrying about losing messages due to ordering.


## unsubscribe

You may also unregister events, in the event that you need to cleanup or prevent memory leaks:

```javascript
const pubsub = require('ev-pubsub')

function myFunc(a, b) {
  console.log('yo!', a, b)
}

const a = pubsub()

a.subscribe('some-event', myFunc)

a.publish('some-event', 'zero arg', 'one arg')


// simulate some time passing
setTimeout(function() {
  a.unsubscribe('some-event', myFunc)
  a.publish('some-event', 'yay!')
}, 1000)

/*
prints:

yo! zero arg one arg
*/
```

