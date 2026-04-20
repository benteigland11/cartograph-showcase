import './_setup_dom.js'
import { defineTiltCard } from '../src/tilt_card.js'

defineTiltCard('tilt-card')

const card = document.createElement('tilt-card')
card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0 })
card.innerHTML = '<p>any content goes inside</p>'
document.body.appendChild(card)

card.dispatchEvent(new PointerEvent('pointermove', { clientX: 50, clientY: 25, bubbles: true }))
console.log('frame transform:', card.shadowRoot.querySelector('.frame').style.transform)
card.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }))
console.log('after leave:', card.shadowRoot.querySelector('.frame').style.transform)
