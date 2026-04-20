import { createParticleField } from '../src/particle_field.js'

function fakeCanvas(w = 200, h = 100) {
  const calls = []
  const ctx = {
    setTransform: (...a) => calls.push(['setTransform', a]),
    clearRect: (...a) => calls.push(['clearRect', a]),
    save: () => calls.push(['save']),
    restore: () => calls.push(['restore']),
    translate: (...a) => calls.push(['translate', a]),
    rotate: (...a) => calls.push(['rotate', a]),
    beginPath: () => calls.push(['beginPath']),
    moveTo: (...a) => calls.push(['moveTo', a]),
    arcTo: (...a) => calls.push(['arcTo', a]),
    closePath: () => calls.push(['closePath']),
    fill: () => calls.push(['fill']),
    set fillStyle(v) { calls.push(['fillStyle', v]) },
    set globalAlpha(v) { calls.push(['globalAlpha', v]) },
  }
  const canvas = {
    width: 0, height: 0,
    getContext: () => ctx,
    getBoundingClientRect: () => ({ width: w, height: h }),
    _calls: calls,
  }
  return canvas
}

let originalRAF, originalCancel, originalMM

beforeEach(() => {
  originalRAF = globalThis.requestAnimationFrame
  originalCancel = globalThis.cancelAnimationFrame
  originalMM = globalThis.matchMedia
  let counter = 0
  globalThis.requestAnimationFrame = (cb) => { counter++; return counter }
  globalThis.cancelAnimationFrame = () => {}
  globalThis.matchMedia = () => ({ matches: false })
})

afterEach(() => {
  globalThis.requestAnimationFrame = originalRAF
  globalThis.cancelAnimationFrame = originalCancel
  globalThis.matchMedia = originalMM
})

describe('createParticleField', () => {
  test('rejects non-canvas target', () => {
    expect(() => createParticleField(null)).toThrow(TypeError)
    expect(() => createParticleField({})).toThrow(TypeError)
  })

  test('initializes particles based on count option', () => {
    const c = fakeCanvas()
    const field = createParticleField(c, { count: 5 })
    expect(field.particles.length).toBe(5)
  })

  test('uses default count when not specified', () => {
    const c = fakeCanvas()
    const field = createParticleField(c)
    expect(field.particles.length).toBe(24)
  })

  test('start triggers requestAnimationFrame', () => {
    const c = fakeCanvas()
    let count = 0
    globalThis.requestAnimationFrame = () => { count++; return 1 }
    const field = createParticleField(c, { count: 2 })
    field.start()
    expect(count).toBeGreaterThan(0)
    field.stop()
  })

  test('start is idempotent when already running', () => {
    const c = fakeCanvas()
    const field = createParticleField(c, { count: 2 })
    field.start()
    field.start()
    field.stop()
  })

  test('stop cancels animation', () => {
    const c = fakeCanvas()
    let cancelled = 0
    globalThis.cancelAnimationFrame = () => { cancelled++ }
    const field = createParticleField(c, { count: 2 })
    field.start()
    field.stop()
    expect(cancelled).toBe(1)
  })

  test('stop is safe when not running', () => {
    const c = fakeCanvas()
    const field = createParticleField(c, { count: 2 })
    expect(() => field.stop()).not.toThrow()
  })

  test('destroy clears particles', () => {
    const c = fakeCanvas()
    const field = createParticleField(c, { count: 5 })
    field.destroy()
    expect(field.particles.length).toBe(0)
  })

  test('resize updates canvas dimensions', () => {
    const c = fakeCanvas()
    const field = createParticleField(c, { count: 2, dpr: 2 })
    expect(c.width).toBe(400)
    expect(c.height).toBe(200)
  })

  test('honors prefers-reduced-motion by painting once and refusing to start', () => {
    globalThis.matchMedia = () => ({ matches: true })
    const c = fakeCanvas()
    const field = createParticleField(c, { count: 3 })
    expect(field.reducedMotion).toBe(true)
    let raf = 0
    globalThis.requestAnimationFrame = () => { raf++; return 1 }
    field.start()
    expect(raf).toBe(0)
  })

  test('honors respectReducedMotion=false override', () => {
    globalThis.matchMedia = () => ({ matches: true })
    const c = fakeCanvas()
    const field = createParticleField(c, { count: 3, respectReducedMotion: false })
    expect(field.reducedMotion).toBe(false)
  })

  test('uses custom colors', () => {
    const c = fakeCanvas()
    const field = createParticleField(c, { count: 10, colors: ['#ff0000'] })
    expect(field.particles.every((p) => p.color === '#ff0000')).toBe(true)
  })

  test('particle sizes within configured range', () => {
    const c = fakeCanvas()
    const field = createParticleField(c, { count: 10, minSize: 5, maxSize: 8 })
    expect(field.particles.every((p) => p.size >= 5 && p.size <= 8)).toBe(true)
  })
})
