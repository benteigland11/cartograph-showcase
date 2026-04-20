import { createNoiseField, valueNoise } from '../src/noise_field.js'

function fakeCanvas(w = 200, h = 100) {
  const ctx = {
    setTransform() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
    set fillStyle(_) {}, set strokeStyle(_) {}, set lineWidth(_) {}, set lineCap(_) {}, set globalAlpha(_) {},
  }
  return {
    width: 0, height: 0,
    getContext: () => ctx,
    getBoundingClientRect: () => ({ width: w, height: h }),
  }
}

let raf, cancelled
beforeEach(() => {
  raf = []; cancelled = []
  globalThis.requestAnimationFrame = (cb) => { raf.push(cb); return raf.length }
  globalThis.cancelAnimationFrame = (id) => cancelled.push(id)
  globalThis.window = { devicePixelRatio: 1 }
  globalThis.matchMedia = () => ({ matches: false })
})

describe('valueNoise', () => {
  test('returns a value between 0 and 1', () => {
    const v = valueNoise(0.3, 0.7)
    expect(v).toBeGreaterThanOrEqual(0)
    expect(v).toBeLessThanOrEqual(1)
  })

  test('is deterministic for the same input', () => {
    expect(valueNoise(1.5, 2.5)).toBe(valueNoise(1.5, 2.5))
  })

  test('varies across inputs', () => {
    expect(valueNoise(1, 2)).not.toBe(valueNoise(50, 50))
  })
})

describe('createNoiseField', () => {
  test('rejects non-canvas target', () => {
    expect(() => createNoiseField(null)).toThrow(TypeError)
  })

  test('seeds default particle count', () => {
    const f = createNoiseField(fakeCanvas())
    expect(f.particles.length).toBe(220)
  })

  test('honors custom count', () => {
    const f = createNoiseField(fakeCanvas(), { count: 50 })
    expect(f.particles.length).toBe(50)
  })

  test('uses custom colors', () => {
    const f = createNoiseField(fakeCanvas(), { count: 10, colors: ['#abc'] })
    expect(f.particles.every((p) => p.color === '#abc')).toBe(true)
  })

  test('start triggers requestAnimationFrame', () => {
    const f = createNoiseField(fakeCanvas(), { count: 5 })
    f.start()
    expect(raf.length).toBeGreaterThan(0)
    f.stop()
  })

  test('start is idempotent', () => {
    const f = createNoiseField(fakeCanvas(), { count: 5 })
    f.start()
    const before = raf.length
    f.start()
    expect(raf.length).toBe(before)
  })

  test('stop cancels animation', () => {
    const f = createNoiseField(fakeCanvas(), { count: 5 })
    f.start()
    f.stop()
    expect(cancelled.length).toBe(1)
  })

  test('stop is safe when not running', () => {
    const f = createNoiseField(fakeCanvas(), { count: 5 })
    expect(() => f.stop()).not.toThrow()
  })

  test('frame advances particle position', () => {
    const f = createNoiseField(fakeCanvas(), { count: 1 })
    const before = { x: f.particles[0].x, y: f.particles[0].y }
    f.start()
    raf[0](performance.now())
    const after = { x: f.particles[0].x, y: f.particles[0].y }
    expect(after.x !== before.x || after.y !== before.y).toBe(true)
    f.stop()
  })

  test('seed reseeds particles', () => {
    const f = createNoiseField(fakeCanvas(), { count: 5 })
    const old = f.particles[0]
    f.seed()
    expect(f.particles[0]).not.toBe(old)
  })

  test('honors prefers-reduced-motion', () => {
    globalThis.matchMedia = () => ({ matches: true })
    const f = createNoiseField(fakeCanvas(), { count: 5 })
    expect(f.reducedMotion).toBe(true)
    f.start()
    expect(raf.length).toBe(0)
  })

  test('respectReducedMotion=false override', () => {
    globalThis.matchMedia = () => ({ matches: true })
    const f = createNoiseField(fakeCanvas(), { count: 5, respectReducedMotion: false })
    expect(f.reducedMotion).toBe(false)
  })

  test('destroy clears particles', () => {
    const f = createNoiseField(fakeCanvas(), { count: 5 })
    f.destroy()
    expect(f.particles.length).toBe(0)
  })

  test('resize recomputes canvas dimensions', () => {
    const c = fakeCanvas()
    const f = createNoiseField(c, { count: 5 })
    c.getBoundingClientRect = () => ({ width: 400, height: 200 })
    f.resize()
    expect(c.width).toBe(400)
    expect(c.height).toBe(200)
  })

  test('particles wrap when out of bounds', () => {
    const f = createNoiseField(fakeCanvas(), { count: 1, speed: 0 })
    f.particles[0].x = -100
    f.particles[0].age = 0
    f.start()
    raf[0](performance.now())
    expect(f.particles[0].x).toBeGreaterThanOrEqual(0)
    f.stop()
  })
})
