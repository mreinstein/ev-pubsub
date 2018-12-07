import removeItems from 'remove-array-items'


export default function pubsub () {
  const _listeners = {}, _onceListeners = {}


  const once = function (topic, handler) {
    if (!_onceListeners[topic])
      _onceListeners[topic] = []

    _onceListeners[topic].push(handler)
  }


  const publish = function (topic, ...args) {
    // execute these in the next process tick rather than synchronously. this
    // enables subscribing to topics after publishing and not missing events
    // that are published before subscribing in the same event loop
    setTimeout(function () {
      if (_listeners[topic]) {
        for (let i=0; i < _listeners[topic].length; i++) {
          _listeners[topic][i](...args)
        }
      }

      if (_onceListeners[topic]) {
        for (let i=_onceListeners[topic].length-1; i >= 0; i--) {
          _onceListeners[topic][i](...args)
          removeItems(_onceListeners[topic], i, 1)
        }
      }
    }, 0)
  }


  const subscribe = function (topic, handler) {
    if (!_listeners[topic])
      _listeners[topic] = []

    // if a function is registered for a topic more than once, likely a bug
    if (_alreadySubscribed(topic, handler))
      console.warn('double adding handler for topic:', topic, ' handler:', handler, 'perhaps this is a bug?')

    _listeners[topic].push(handler)
  }


  // @param function handler if ommitted, remove all handlers for this topic
  const unsubscribe = function (topic, handler) {
    if (_listeners[topic]) {
      if (!handler) {
        _listeners[topic] = []
        return
      }
      for (let i=0; i < _listeners[topic].length; i++) {
        if (_listeners[topic][i] === handler) {
          removeItems(_listeners[topic], i, 1)
          return
        }
      }
    }
  }


  const _alreadySubscribed = function (topic, handler) {
    if (!_listeners[topic]) return false

    for (let i=0; i < _listeners[topic].length; i++)
      if (_listeners[topic][i] === handler)
        return true

    return false
  }


  return Object.freeze({ publish, subscribe, unsubscribe, once })
}
