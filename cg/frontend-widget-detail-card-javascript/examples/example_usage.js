import './_setup_dom.js'
import { defineWidgetDetailCard } from '../src/widget_detail_card.js'

defineWidgetDetailCard('widget-detail-card')

const card = document.createElement('widget-detail-card')
document.body.appendChild(card)
card.widget = {
  id: 'frontend-example-javascript',
  description: 'A sample widget shown in the detail card.',
  version: '1.0.0',
  language: 'javascript',
  domain: 'frontend',
  owner: 'someone',
  install_count: 42,
  rating: 4.5,
  dependencies: ['some-dep>=1.0.0'],
}

console.log('id rendered:', card.shadowRoot.querySelector('.id').textContent)
console.log('install command:', card.shadowRoot.querySelector('.cmd').textContent)
console.log('deps shown:', !card.shadowRoot.querySelector('.deps').hidden)
card.remove()
