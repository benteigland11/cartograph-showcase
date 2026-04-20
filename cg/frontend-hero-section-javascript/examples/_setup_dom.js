import { Window } from 'happy-dom'

const window = new Window()
globalThis.HTMLElement = window.HTMLElement
globalThis.customElements = window.customElements
globalThis.document = window.document
