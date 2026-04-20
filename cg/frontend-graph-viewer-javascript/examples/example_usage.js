import './_setup_dom.js'
import { createGraphViewer } from '../src/graph_viewer.js'

const ctx = {
  setTransform() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
  arc() {}, fill() {}, fillText() {},
  set fillStyle(_) {}, set strokeStyle(_) {}, set lineWidth(_) {}, set globalAlpha(_) {},
  set font(_) {}, set textAlign(_) {}, set textBaseline(_) {},
}
const fakeCanvas = {
  getContext: () => ctx,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 300 }),
  addEventListener: () => {}, removeEventListener: () => {},
  style: {},
}

const g = createGraphViewer(fakeCanvas, {
  nodes: [{ id: 'one' }, { id: 'two' }, { id: 'three' }],
  edges: [{ source: 'one', target: 'two' }, { source: 'two', target: 'three' }],
})

console.log('nodes:', g.nodes.length)
console.log('edges:', g.edges.length)
g.destroy()
