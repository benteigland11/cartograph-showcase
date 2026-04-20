import './_setup_dom.js'
import { defineClusterLayout } from '../src/cluster_layout.js'

defineClusterLayout('cluster-layout')

const cluster = document.createElement('cluster-layout')
for (const t of ['one', 'two', 'three', 'four']) {
  const chip = document.createElement('span')
  chip.textContent = t
  cluster.appendChild(chip)
}
document.body.appendChild(cluster)

console.log('children:', cluster.children.length)
console.log('styles injected:', !!document.getElementById('cluster-layout-styles'))
