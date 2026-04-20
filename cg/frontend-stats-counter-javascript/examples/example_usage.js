import './_setup_dom.js'
import { defineStatsCounter } from '../src/stats_counter.js'

defineStatsCounter('stats-counter')

const el = document.createElement('stats-counter')
el.setAttribute('target', '1234')
el.setAttribute('duration', '20')
el.setAttribute('autoplay', '')
el.setAttribute('suffix', '+')
document.body.appendChild(el)

await new Promise((resolve) => el.addEventListener('counter-complete', resolve))
console.log('settled value:', el.shadowRoot.querySelector('.value').textContent)
el.remove()
