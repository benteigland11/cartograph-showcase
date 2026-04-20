import { createEventBus } from '../src/event_bus.js'

const bus = createEventBus()

bus.on('user-action', (payload) => {
  console.log('handler A saw:', payload)
})

const offB = bus.on('user-action', (payload) => {
  console.log('handler B saw:', payload)
})

bus.emit('user-action', { type: 'click', target: 'button' })

offB()
console.log('after unsubscribing B, listenerCount:', bus.listenerCount('user-action'))

bus.once('one-shot', (n) => console.log('once handler:', n))
bus.emit('one-shot', 1)
bus.emit('one-shot', 2)

bus.clear()
console.log('after clear, listenerCount:', bus.listenerCount('user-action'))
