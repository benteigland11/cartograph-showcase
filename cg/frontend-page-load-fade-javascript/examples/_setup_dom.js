import { Window } from 'happy-dom'

const window = new Window()
globalThis.document = window.document
globalThis.window = window
globalThis.HTMLElement = window.HTMLElement
