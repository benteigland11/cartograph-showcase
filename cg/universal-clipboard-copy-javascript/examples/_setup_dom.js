import { Window } from 'happy-dom'

const window = new Window()
globalThis.document = window.document
Object.defineProperty(globalThis, 'navigator', {
  value: { clipboard: { writeText: async () => {} } },
  writable: true,
  configurable: true,
})
