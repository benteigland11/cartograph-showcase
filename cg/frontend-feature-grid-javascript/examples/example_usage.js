import './_setup_dom.js'
import { defineFeatureGrid } from '../src/feature_grid.js'

defineFeatureGrid('feature-grid', 'feature-card')

const grid = document.createElement('feature-grid')
grid.innerHTML = `
  <feature-card>
    <span slot="icon">★</span>
    <span slot="title">Fast</span>
    Built for speed.
  </feature-card>
  <feature-card>
    <span slot="icon">◆</span>
    <span slot="title">Solid</span>
    Tested and reliable.
  </feature-card>
`
document.body.appendChild(grid)

console.log('grid styles injected:', !!document.getElementById('feature-grid-styles'))
console.log('cards:', grid.querySelectorAll('feature-card').length)
