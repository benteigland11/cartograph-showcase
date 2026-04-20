import './_setup_dom.js'
import { defineTextScramble } from '../src/text_scramble.js'

defineTextScramble('text-scramble')

const el = document.createElement('text-scramble')
el.setAttribute('text', 'hello world')
el.setAttribute('speed', '50')
document.body.appendChild(el)
await el.play()
console.log('settled:', el.shadowRoot.querySelector('.output').textContent)
el.remove()
