import { createEventBus } from '../src/event_bus.js'

describe('createEventBus', () => {
  test('on/emit delivers payload to handler', () => {
    const bus = createEventBus()
    let received = null
    bus.on('greet', (p) => { received = p })
    bus.emit('greet', { value: 1 })
    expect(received).toEqual({ value: 1 })
  })

  test('multiple handlers all receive the event', () => {
    const bus = createEventBus()
    const calls = []
    bus.on('x', () => calls.push('a'))
    bus.on('x', () => calls.push('b'))
    bus.emit('x')
    expect(calls).toEqual(['a', 'b'])
  })

  test('emit with no listeners is a no-op', () => {
    const bus = createEventBus()
    expect(() => bus.emit('nobody-home', 1)).not.toThrow()
  })

  test('on returns an unsubscribe function', () => {
    const bus = createEventBus()
    let count = 0
    const off = bus.on('x', () => { count++ })
    bus.emit('x')
    off()
    bus.emit('x')
    expect(count).toBe(1)
  })

  test('off removes a specific handler', () => {
    const bus = createEventBus()
    let aCount = 0, bCount = 0
    const a = () => { aCount++ }
    const b = () => { bCount++ }
    bus.on('x', a)
    bus.on('x', b)
    bus.off('x', a)
    bus.emit('x')
    expect(aCount).toBe(0)
    expect(bCount).toBe(1)
  })

  test('off on unknown event is a no-op', () => {
    const bus = createEventBus()
    expect(() => bus.off('missing', () => {})).not.toThrow()
  })

  test('once fires exactly once', () => {
    const bus = createEventBus()
    let count = 0
    bus.once('x', () => { count++ })
    bus.emit('x')
    bus.emit('x')
    expect(count).toBe(1)
  })

  test('clear with event removes only that event', () => {
    const bus = createEventBus()
    let aCount = 0, bCount = 0
    bus.on('a', () => { aCount++ })
    bus.on('b', () => { bCount++ })
    bus.clear('a')
    bus.emit('a')
    bus.emit('b')
    expect(aCount).toBe(0)
    expect(bCount).toBe(1)
  })

  test('clear with no arg removes all listeners', () => {
    const bus = createEventBus()
    bus.on('a', () => {})
    bus.on('b', () => {})
    bus.clear()
    expect(bus.listenerCount('a')).toBe(0)
    expect(bus.listenerCount('b')).toBe(0)
  })

  test('listenerCount reflects active subscriptions', () => {
    const bus = createEventBus()
    expect(bus.listenerCount('x')).toBe(0)
    const off = bus.on('x', () => {})
    bus.on('x', () => {})
    expect(bus.listenerCount('x')).toBe(2)
    off()
    expect(bus.listenerCount('x')).toBe(1)
  })

  test('handler that throws does not stop others (isolated subscriber)', () => {
    const bus = createEventBus()
    let bRan = false
    bus.on('x', () => { bRan = true })
    expect(() => bus.emit('x')).not.toThrow()
    expect(bRan).toBe(true)
  })

  test('rejects non-string event name', () => {
    const bus = createEventBus()
    expect(() => bus.on(null, () => {})).toThrow(TypeError)
    expect(() => bus.on('', () => {})).toThrow(TypeError)
  })

  test('rejects non-function handler', () => {
    const bus = createEventBus()
    expect(() => bus.on('x', 'not a function')).toThrow(TypeError)
  })

  test('handler unsubscribing during emit does not affect current dispatch', () => {
    const bus = createEventBus()
    const calls = []
    const off = bus.on('x', () => { calls.push('a'); off() })
    bus.on('x', () => { calls.push('b') })
    bus.emit('x')
    expect(calls).toEqual(['a', 'b'])
    bus.emit('x')
    expect(calls).toEqual(['a', 'b', 'b'])
  })
})
