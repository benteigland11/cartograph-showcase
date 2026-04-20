export function createEventBus() {
  const listeners = new Map()

  function on(event, handler) {
    if (typeof event !== 'string' || !event) {
      throw new TypeError('event name must be a non-empty string')
    }
    if (typeof handler !== 'function') {
      throw new TypeError('handler must be a function')
    }
    if (!listeners.has(event)) listeners.set(event, new Set())
    listeners.get(event).add(handler)
    return () => off(event, handler)
  }

  function once(event, handler) {
    const wrapped = (payload) => {
      off(event, wrapped)
      handler(payload)
    }
    return on(event, wrapped)
  }

  function off(event, handler) {
    const set = listeners.get(event)
    if (!set) return
    set.delete(handler)
    if (set.size === 0) listeners.delete(event)
  }

  function emit(event, payload) {
    const set = listeners.get(event)
    if (!set) return
    for (const handler of [...set]) {
      handler(payload)
    }
  }

  function clear(event) {
    if (event === undefined) listeners.clear()
    else listeners.delete(event)
  }

  function listenerCount(event) {
    return listeners.get(event)?.size ?? 0
  }

  return { on, once, off, emit, clear, listenerCount }
}
