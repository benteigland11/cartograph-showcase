import { Window } from 'happy-dom'

const window = new Window()
globalThis.document = window.document
globalThis.window = window
globalThis.matchMedia = () => ({ matches: false })
globalThis.requestAnimationFrame = (cb) => 1
globalThis.cancelAnimationFrame = () => {}
