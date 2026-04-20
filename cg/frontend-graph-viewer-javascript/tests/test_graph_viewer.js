import { createGraphViewer } from '../src/graph_viewer.js'

function fakeCanvas(w = 400, h = 300) {
  const ctx = {
    setTransform() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
    arc() {}, fill() {}, fillText() {},
    set fillStyle(_) {}, set strokeStyle(_) {}, set lineWidth(_) {}, set globalAlpha(_) {},
    set font(_) {}, set textAlign(_) {}, set textBaseline(_) {},
  }
  const listeners = {}
  return {
    width: 0, height: 0, style: {},
    getContext: () => ctx,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: w, height: h }),
    addEventListener: (t, h) => { listeners[t] = h },
    removeEventListener: (t, h) => { if (listeners[t] === h) delete listeners[t] },
    setPointerCapture: () => {},
    releasePointerCapture: () => {},
    dispatch: (t, e = {}) => listeners[t]?.(e),
    listeners,
  }
}

let raf, cancelled
beforeEach(() => {
  raf = []; cancelled = []
  globalThis.requestAnimationFrame = (cb) => { raf.push(cb); return raf.length }
  globalThis.cancelAnimationFrame = (id) => cancelled.push(id)
  globalThis.window = { devicePixelRatio: 1 }
})

const sample = {
  nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
  edges: [{ source: 'a', target: 'b' }, { source: 'b', target: 'c' }],
}

describe('createGraphViewer', () => {
  test('rejects non-canvas target', () => {
    expect(() => createGraphViewer(null)).toThrow(TypeError)
  })

  test('builds nodes and edges from data', () => {
    const g = createGraphViewer(fakeCanvas(), sample)
    expect(g.nodes.length).toBe(3)
    expect(g.edges.length).toBe(2)
  })

  test('drops self-loops and unknown ids', () => {
    const g = createGraphViewer(fakeCanvas(), {
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [{ source: 'a', target: 'a' }, { source: 'a', target: 'unknown' }, { source: 'a', target: 'b' }],
    })
    expect(g.edges.length).toBe(1)
  })

  test('uses node color when provided', () => {
    const g = createGraphViewer(fakeCanvas(), { nodes: [{ id: 'a', color: '#abc' }], edges: [] })
    expect(g.nodes[0].color).toBe('#abc')
  })

  test('node weight scales radius', () => {
    const g = createGraphViewer(fakeCanvas(), { nodes: [{ id: 'a', weight: 1 }, { id: 'b', weight: 100 }], edges: [] })
    expect(g.nodes[1].r).toBeGreaterThan(g.nodes[0].r)
  })

  test('start triggers requestAnimationFrame', () => {
    const g = createGraphViewer(fakeCanvas(), sample)
    g.start()
    expect(raf.length).toBeGreaterThan(0)
    g.stop()
  })

  test('start is idempotent', () => {
    const g = createGraphViewer(fakeCanvas(), sample)
    g.start()
    const before = raf.length
    g.start()
    expect(raf.length).toBe(before)
  })

  test('stop cancels animation', () => {
    const g = createGraphViewer(fakeCanvas(), sample)
    g.start()
    g.stop()
    expect(cancelled.length).toBe(1)
  })

  test('frame advances simulation', () => {
    const c = fakeCanvas()
    const g = createGraphViewer(c, sample)
    const before = { x: g.nodes[0].x, y: g.nodes[0].y }
    g.start()
    raf[0]()
    expect(g.nodes[0].x !== before.x || g.nodes[0].y !== before.y).toBe(true)
    g.stop()
  })

  test('setData replaces nodes and edges', () => {
    const g = createGraphViewer(fakeCanvas(), sample)
    g.setData([{ id: 'x' }], [])
    expect(g.nodes.length).toBe(1)
    expect(g.edges.length).toBe(0)
  })

  test('pointerdown picks a node and starts drag', () => {
    const c = fakeCanvas()
    const g = createGraphViewer(c, sample)
    g.nodes[0].x = 100; g.nodes[0].y = 100
    c.dispatch('pointerdown', { clientX: 100, clientY: 100, pointerId: 1 })
    c.dispatch('pointermove', { clientX: 200, clientY: 150, pointerId: 1 })
    expect(g.nodes[0].x).toBe(200)
    expect(g.nodes[0].y).toBe(150)
    c.dispatch('pointerup', { pointerId: 1 })
  })

  test('hover sets hovered index', () => {
    const c = fakeCanvas()
    const g = createGraphViewer(c, sample)
    g.nodes[0].x = 50; g.nodes[0].y = 50
    c.dispatch('pointermove', { clientX: 50, clientY: 50 })
    expect(g.hovered).toBe(0)
  })

  test('pointerleave clears hover', () => {
    const c = fakeCanvas()
    const g = createGraphViewer(c, sample)
    g.nodes[0].x = 50; g.nodes[0].y = 50
    c.dispatch('pointermove', { clientX: 50, clientY: 50 })
    c.dispatch('pointerleave')
    expect(g.hovered).toBe(null)
  })

  test('destroy clears nodes and removes listeners', () => {
    const c = fakeCanvas()
    const g = createGraphViewer(c, sample)
    g.destroy()
    expect(g.nodes.length).toBe(0)
    expect(Object.keys(c.listeners).length).toBe(0)
  })

  test('resize updates canvas dimensions', () => {
    const c = fakeCanvas()
    const g = createGraphViewer(c, sample)
    c.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 400 })
    g.resize()
    expect(c.width).toBe(800)
  })

  test('node defaults id from index when missing', () => {
    const g = createGraphViewer(fakeCanvas(), { nodes: [{}, {}], edges: [] })
    expect(g.nodes[0].id).toBe('0')
    expect(g.nodes[1].id).toBe('1')
  })

  test('node defaults label to id when missing', () => {
    const g = createGraphViewer(fakeCanvas(), { nodes: [{ id: 'a' }], edges: [] })
    expect(g.nodes[0].label).toBe('a')
  })

  test('node defaults color when missing', () => {
    const g = createGraphViewer(fakeCanvas(), { nodes: [{ id: 'a' }], edges: [] })
    expect(g.nodes[0].color).toBe('#FFC300')
  })

  test('node honors x and y when provided', () => {
    const g = createGraphViewer(fakeCanvas(), { nodes: [{ id: 'a', x: 50, y: 60 }], edges: [] })
    expect(g.nodes[0].x).toBe(50)
    expect(g.nodes[0].y).toBe(60)
  })

  test('pointermove with no hit clears hover', () => {
    const c = fakeCanvas()
    const g = createGraphViewer(c, sample)
    g.nodes.forEach((n) => { n.x = 9999; n.y = 9999 })
    c.dispatch('pointermove', { clientX: 0, clientY: 0 })
    expect(g.hovered).toBe(null)
  })

  test('pointerdown on empty area does not start drag', () => {
    const c = fakeCanvas()
    const g = createGraphViewer(c, sample)
    g.nodes.forEach((n) => { n.x = 9999; n.y = 9999 })
    c.dispatch('pointerdown', { clientX: 0, clientY: 0, pointerId: 1 })
    c.dispatch('pointermove', { clientX: 100, clientY: 100, pointerId: 1 })
    expect(g.nodes[0].x).toBe(9999)
  })

  test('pointerup with no active drag is safe', () => {
    const c = fakeCanvas()
    const g = createGraphViewer(c, sample)
    expect(() => c.dispatch('pointerup', { pointerId: 1 })).not.toThrow()
  })

  test('frame draws hovered state without throwing', () => {
    const c = fakeCanvas()
    const g = createGraphViewer(c, sample)
    g.nodes[0].x = 50; g.nodes[0].y = 50
    c.dispatch('pointermove', { clientX: 50, clientY: 50 })
    g.start()
    expect(() => raf[0]()).not.toThrow()
    g.stop()
  })

  test('showLabels=false skips label rendering path', () => {
    const c = fakeCanvas()
    const g = createGraphViewer(c, { ...sample, showLabels: false })
    g.start()
    expect(() => raf[0]()).not.toThrow()
    g.stop()
  })
})
