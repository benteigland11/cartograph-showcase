import './_setup_dom.js'
import { defineSpringDrag } from '../src/spring_drag.js'

defineSpringDrag('spring-drag')

const el = document.createElement('spring-drag')
el.innerHTML = '<button>drag me</button>'
document.body.appendChild(el)

const puck = el.shadowRoot.querySelector('.puck')
puck.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0, pointerId: 1, bubbles: true }))
el.dispatchEvent(new PointerEvent('pointermove', { clientX: 25, clientY: 25, pointerId: 1, bubbles: true }))
console.log('dragged to:', el._x, el._y)
el.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }))
console.log('drag ended:', !el.hasAttribute('dragging'))
el.remove()
