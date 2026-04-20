import { Window } from 'happy-dom'

const window = new Window()
globalThis.document = window.document
globalThis.PointerEvent = window.PointerEvent ?? window.MouseEvent
