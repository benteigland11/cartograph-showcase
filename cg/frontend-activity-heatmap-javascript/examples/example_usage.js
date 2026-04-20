import './_setup_dom.js'
import { defineActivityHeatmap } from '../src/activity_heatmap.js'

defineActivityHeatmap('activity-heatmap')

const el = document.createElement('activity-heatmap')
el.weeks = 12
const today = new Date()
const data = []
for (let i = 0; i < 84; i++) {
  const d = new Date(today)
  d.setDate(today.getDate() - i)
  if (Math.random() > 0.6) data.push({ date: d.toISOString().slice(0, 10), count: Math.ceil(Math.random() * 8) })
}
el.data = data
document.body.appendChild(el)

const cells = el.shadowRoot.querySelectorAll('.grid .cell')
console.log('cells rendered:', cells.length)
const filled = Array.from(cells).filter((c) => c.dataset.value !== '0')
console.log('filled cells:', filled.length)
el.remove()
