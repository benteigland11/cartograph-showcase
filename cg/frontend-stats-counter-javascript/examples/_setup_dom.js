import { Window } from 'happy-dom'

const window = new Window()
globalThis.HTMLElement = window.HTMLElement
globalThis.customElements = window.customElements
globalThis.document = window.document
globalThis.CustomEvent = window.CustomEvent
globalThis.IntersectionObserver = class {
  constructor(cb) { this.cb = cb }
  observe(el) { this.cb([{ isIntersecting: true, target: el }]) }
  disconnect() {}
}
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
