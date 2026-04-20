import './_setup_dom.js'
import { defineGridLayout } from '../src/grid_layout.js'

defineGridLayout('grid-layout')

const grid = document.createElement('grid-layout')
grid.style.setProperty('--grid-min', '12rem')
for (let i = 0; i < 6; i++) {
  const card = document.createElement('article')
  card.textContent = `card ${i + 1}`
  grid.appendChild(card)
}
document.body.appendChild(grid)

console.log('children:', grid.children.length)
console.log('styles injected:', !!document.getElementById('grid-layout-styles'))
