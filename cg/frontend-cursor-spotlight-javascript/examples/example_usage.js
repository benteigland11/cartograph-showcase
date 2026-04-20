import './_setup_dom.js'
import { attachSpotlight, injectSpotlightStyles } from '../src/cursor_spotlight.js'

injectSpotlightStyles()

const card = document.createElement('div')
card.setAttribute('data-spotlight', '')
card.getBoundingClientRect = () => ({ left: 0, top: 0, right: 200, bottom: 100, width: 200, height: 100, x: 0, y: 0 })
document.body.appendChild(card)

const handle = attachSpotlight(card)
card.dispatchEvent(new PointerEvent('pointermove', { clientX: 80, clientY: 40, bubbles: true }))

console.log('spotlight x:', card.style.getPropertyValue('--spotlight-x'))
console.log('spotlight y:', card.style.getPropertyValue('--spotlight-y'))
handle.detach()
