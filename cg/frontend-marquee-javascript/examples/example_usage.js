import './_setup_dom.js'
import { defineMarquee } from '../src/marquee.js'

defineMarquee('marquee-row')

const m = document.createElement('marquee-row')
m.setAttribute('speed', '20')
const items = ['one', 'two', 'three'].map((t) => {
  const span = document.createElement('span')
  span.textContent = t
  return span
})
items.forEach((s) => m.appendChild(s))
document.body.appendChild(m)

const clone = m.shadowRoot.querySelector('.row[aria-hidden="true"]')
console.log('clone count:', clone.children.length)
console.log('duration:', m.style.getPropertyValue('--m-duration'))
