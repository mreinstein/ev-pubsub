# ev-pubsub

asynchronous publish/subscribe module.

npm is flooded with similar modules but I couldn't find any that satisfy all of these criteria:

* doesn't generate memory garbage
* favors factory pattern over terrible javascript classes
* events published in next event loop tick
* works in both commonjs (require) and es modules (import)
* simple (< 100 lines of code)


so, here we are.


## including

```javascript
import pubsub from 'ev-pubsub'  // modern es modules approach

// *OR*

const pubsub = require('ev-pubsub') // commonjs (node) approach
```


## basic usage
 
```javascript
const a = pubsub()

a.subscribe('red-light', function (arg1, arg2, arg3) {
  console.log('hello from 1:', arg1)
})

a.subscribe('red-light', function (arg1, arg2, arg3) {
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
many pubsub implementations immediately invoke published events.

A problem with this approach is you might end up missing events if they happen before subscribing to them.

`ev-pubsub` gets around this by invoking published events in the next event tick (asynchronously.) example:

```javascript
function myFunc (a) {
  console.log('test', a)
}


const mine = pubsub()
mine.publish('some-event', 'omg it happened!')

mine.subscribe('some-event', function (msg) {
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

You may also unregister event handlers if you need to cleanup or prevent memory leaks:

```javascript
function myFunc (a, b) {
  console.log('yo!', a, b)
}

const a = pubsub()

a.subscribe('some-event', myFunc)

a.publish('some-event', 'zero arg', 'one arg')


// simulate some time passing
setTimeout(function () {
  a.unsubscribe('some-event', myFunc)
  a.publish('some-event', 'yay!')
}, 1000)

/*
prints:

yo! zero arg one arg
*/
```


## unsubscribe all handlers for a given topic

```javascript
function myFunc (a) {
  console.log('yo!', a)
}

function myFunc2 (a) {
  console.log('yo2!', a)
}

const a = pubsub()

a.subscribe('some-event', myFunc)

a.subscribe('some-event', myFunc2)

a.publish('some-event', 'ayy')

a.unsubscribe('some-event')

console.log('unsubscribed all...')
a.publish('some-event', 'beee')

/*
prints:

yo! ayy
yo2! ayy
unsubscribed all...
*/
```


## once

You may want to only subscribe to one event:

```javascript
function myFunc (a) {
  console.log('yo!', a)
}

const a = pubsub()

a.once('some-event', myFunc)

a.publish('some-event', '15')
a.publish('some-event', '16')


/*
prints:

yo! 15
*/
```
