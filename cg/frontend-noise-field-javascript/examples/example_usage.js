import './_setup_dom.js'
import { createNoiseField, valueNoise } from '../src/noise_field.js'

const ctx = {
  setTransform() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
  set fillStyle(_) {}, set strokeStyle(_) {}, set lineWidth(_) {}, set lineCap(_) {}, set globalAlpha(_) {},
}
const fakeCanvas = {
  getContext: () => ctx,
  getBoundingClientRect: () => ({ width: 800, height: 400 }),
}

const field = createNoiseField(fakeCanvas, { count: 50 })
console.log('particles:', field.particles.length)
console.log('noise(1,1):', valueNoise(1, 1).toFixed(4))
field.start()
field.stop()
field.destroy()
