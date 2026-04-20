import { Window } from 'happy-dom'

const window = new Window()
globalThis.HTMLElement = window.HTMLElement
globalThis.customElements = window.customElements
globalThis.document = window.document
globalThis.CustomEvent = window.CustomEvent
globalThis.AbortController = window.AbortController
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
