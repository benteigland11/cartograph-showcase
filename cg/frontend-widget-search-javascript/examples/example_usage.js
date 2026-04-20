import './_setup_dom.js'
import { defineWidgetSearch } from '../src/widget_search.js'

defineWidgetSearch('widget-search')

const el = document.createElement('widget-search')
el.fetcher = async (q) => [
  { id: 'item-one', description: `match for ${q}`, rating: 4.5, install_count: 42 },
]
el.debounceMs = 0
document.body.appendChild(el)

const input = el.shadowRoot.querySelector('.input')
input.value = 'thing'
input.dispatchEvent(new Event('input'))

await new Promise((r) => setTimeout(r, 30))

console.log('rows rendered:', el.shadowRoot.querySelectorAll('.row').length)
console.log('open state:', el.hasAttribute('data-open'))
