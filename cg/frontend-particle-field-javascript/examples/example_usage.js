import './_setup_dom.js'
import { createParticleField } from '../src/particle_field.js'

const fakeCtx = {
  setTransform() {}, clearRect() {}, save() {}, restore() {}, translate() {},
  rotate() {}, beginPath() {}, moveTo() {}, arcTo() {}, closePath() {}, fill() {},
  set fillStyle(_) {}, set globalAlpha(_) {},
}
const fakeCanvas = {
  width: 0, height: 0,
  getContext: () => fakeCtx,
  getBoundingClientRect: () => ({ width: 800, height: 400 }),
}

const field = createParticleField(fakeCanvas, { count: 12 })
console.log('particles created:', field.particles.length)
console.log('first color:', field.particles[0].color)
field.start()
field.stop()
field.destroy()
console.log('after destroy:', field.particles.length)
