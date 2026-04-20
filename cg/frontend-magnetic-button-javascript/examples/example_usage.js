import './_setup_dom.js'
import { defineMagneticButton } from '../src/magnetic_button.js'

defineMagneticButton('magnetic-button')

const el = document.createElement('magnetic-button')
el.innerHTML = '<button>click me</button>'
el.getBoundingClientRect = () => ({ left: 100, top: 100, right: 160, bottom: 160, width: 60, height: 60, x: 100, y: 100 })
document.body.appendChild(el)

document.dispatchEvent(new PointerEvent('pointermove', { clientX: 140, clientY: 130, bubbles: true }))
console.log('transform after pull:', el.shadowRoot.querySelector('.puck').style.transform)
el.remove()
