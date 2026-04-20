import { Window } from 'happy-dom'

const window = new Window()
globalThis.document = window.document
globalThis.MouseEvent = window.MouseEvent
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
