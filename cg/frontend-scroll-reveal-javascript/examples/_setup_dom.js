import { Window } from 'happy-dom'

const window = new Window()
globalThis.document = window.document
globalThis.IntersectionObserver = class {
  constructor(cb) { this.cb = cb }
  observe(el) { this.cb([{ isIntersecting: true, target: el }]) }
  unobserve() {}
  disconnect() {}
}
