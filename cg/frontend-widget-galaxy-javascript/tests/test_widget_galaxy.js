import { createWidgetGalaxy, DOMAIN_COLORS } from '../src/widget_galaxy.js'

class FakeColor { constructor(c) { this.value = c } }
class FakeFog { constructor(c, n, f) { this.color = c; this.near = n; this.far = f } }
class FakeVec2 { constructor() { this.x = 0; this.y = 0 } }
class FakeRaycaster {
  constructor() { this.lastCamera = null }
  setFromCamera(p, cam) { this.lastCamera = cam }
  intersectObjects(arr) { return FakeRaycaster.next ? [{ object: arr[0] }] : [] }
}
FakeRaycaster.next = false

class FakeGroup {
  constructor() { this.children = []; this.rotation = { y: 0 } }
  add(m) { this.children.push(m) }
  remove(m) { this.children = this.children.filter((c) => c !== m) }
}
class FakeScene extends FakeGroup {
  constructor() { super(); this.background = null; this.fog = null }
}
class FakeMesh {
  constructor(geo, mat) { this.geometry = geo; this.material = mat; this.position = { set(x,y,z){ this.x=x;this.y=y;this.z=z } }; this.userData = {} }
}
class FakeGeometry { dispose() { this.disposed = true } }
class FakeMaterial { constructor(opts) { Object.assign(this, opts); this.emissiveIntensity = opts?.emissiveIntensity ?? 0 } dispose() { this.disposed = true } }
class FakeCamera { constructor() { this.position = { set: () => {} }; this.aspect = 1 } updateProjectionMatrix() {} }
class FakeLight {}
class FakeRenderer {
  constructor() { this.calls = [] }
  setPixelRatio() {}
  setSize(w, h) { this.w = w; this.h = h }
  render(scene, camera) { this.calls.push([scene, camera]) }
  dispose() { this.disposed = true }
}

const FakeTHREE = {
  Scene: FakeScene,
  Color: FakeColor,
  Fog: FakeFog,
  PerspectiveCamera: FakeCamera,
  WebGLRenderer: FakeRenderer,
  AmbientLight: FakeLight,
  DirectionalLight: class { constructor() { this.position = { set: () => {} } } },
  Group: FakeGroup,
  BoxGeometry: FakeGeometry,
  MeshStandardMaterial: FakeMaterial,
  Mesh: FakeMesh,
  Raycaster: FakeRaycaster,
  Vector2: FakeVec2,
}

function fakeCanvas(w = 800, h = 600) {
  const ctx = {}
  return {
    width: 0, height: 0, style: {},
    getContext: () => ctx,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: w, height: h }),
    addEventListener: function (type, handler) { (this._listeners ??= {})[type] = handler },
    removeEventListener: function (type, handler) { if (this._listeners?.[type] === handler) delete this._listeners[type] },
    dispatch(type, e = {}) { this._listeners?.[type]?.(e) },
  }
}

let raf, cancelled
beforeEach(() => {
  raf = []; cancelled = []
  globalThis.requestAnimationFrame = (cb) => { raf.push(cb); return raf.length }
  globalThis.cancelAnimationFrame = (id) => cancelled.push(id)
  globalThis.window = { devicePixelRatio: 1 }
  FakeRaycaster.next = false
})

const sample = [
  { id: 'a', domain: 'frontend', install_count: 100 },
  { id: 'b', domain: 'backend', install_count: 0 },
  { id: 'c', domain: 'unknown', install_count: 5000 },
]

describe('createWidgetGalaxy', () => {
  test('rejects non-canvas target', () => {
    expect(() => createWidgetGalaxy(null, { THREE: FakeTHREE })).toThrow(TypeError)
  })

  test('requires THREE', () => {
    expect(() => createWidgetGalaxy(fakeCanvas(), {})).toThrow(TypeError)
  })

  test('builds one cube per widget', () => {
    const g = createWidgetGalaxy(fakeCanvas(), { THREE: FakeTHREE }, { widgets: sample })
    expect(g.cubes.length).toBe(3)
  })

  test('exposes scene and camera', () => {
    const g = createWidgetGalaxy(fakeCanvas(), { THREE: FakeTHREE }, { widgets: sample })
    expect(g.scene).toBeTruthy()
    expect(g.camera).toBeTruthy()
  })

  test('uses domain color from defaults', () => {
    const g = createWidgetGalaxy(fakeCanvas(), { THREE: FakeTHREE }, { widgets: [{ id: 'x', domain: 'frontend', install_count: 1 }] })
    expect(g.cubes[0].mesh.material.color).toBe(DOMAIN_COLORS.frontend)
  })

  test('falls back to default color for unknown domain', () => {
    const g = createWidgetGalaxy(fakeCanvas(), { THREE: FakeTHREE }, { widgets: [{ id: 'x', domain: 'mystery', install_count: 1 }] })
    expect(g.cubes[0].mesh.material.color).toBe(DOMAIN_COLORS.default)
  })

  test('honors custom domain colors', () => {
    const g = createWidgetGalaxy(fakeCanvas(), { THREE: FakeTHREE }, {
      widgets: [{ id: 'x', domain: 'frontend', install_count: 1 }],
      domainColors: { frontend: 0xff00ff, default: 0x000000 },
    })
    expect(g.cubes[0].mesh.material.color).toBe(0xff00ff)
  })

  test('start schedules animation frame', () => {
    const g = createWidgetGalaxy(fakeCanvas(), { THREE: FakeTHREE }, { widgets: sample })
    g.start()
    expect(raf.length).toBeGreaterThan(0)
    g.stop()
  })

  test('start is idempotent', () => {
    const g = createWidgetGalaxy(fakeCanvas(), { THREE: FakeTHREE }, { widgets: sample })
    g.start()
    const before = raf.length
    g.start()
    expect(raf.length).toBe(before)
  })

  test('stop cancels animation', () => {
    const g = createWidgetGalaxy(fakeCanvas(), { THREE: FakeTHREE }, { widgets: sample })
    g.start()
    g.stop()
    expect(cancelled.length).toBe(1)
  })

  test('stop is safe when not running', () => {
    const g = createWidgetGalaxy(fakeCanvas(), { THREE: FakeTHREE }, { widgets: sample })
    expect(() => g.stop()).not.toThrow()
  })

  test('setWidgets rebuilds cubes', () => {
    const g = createWidgetGalaxy(fakeCanvas(), { THREE: FakeTHREE }, { widgets: sample })
    g.setWidgets([{ id: 'just-one', domain: 'data', install_count: 0 }])
    expect(g.cubes.length).toBe(1)
  })

  test('hovering a cube fires onHover with widget', () => {
    const c = fakeCanvas()
    let hovered = null
    const g = createWidgetGalaxy(c, { THREE: FakeTHREE }, { widgets: sample, onHover: (w) => { hovered = w } })
    FakeRaycaster.next = true
    c.dispatch('pointermove', { clientX: 10, clientY: 10 })
    expect(hovered).toBe(sample[0])
    FakeRaycaster.next = false
    c.dispatch('pointermove', { clientX: 0, clientY: 0 })
    expect(hovered).toBe(null)
  })

  test('clicking a cube fires onSelect with widget', () => {
    const c = fakeCanvas()
    let selected = null
    const g = createWidgetGalaxy(c, { THREE: FakeTHREE }, { widgets: sample, onSelect: (w) => { selected = w } })
    FakeRaycaster.next = true
    c.dispatch('click', { clientX: 10, clientY: 10 })
    expect(selected).toBe(sample[0])
  })

  test('pointerleave clears hover', () => {
    const c = fakeCanvas()
    let last = 'never'
    const g = createWidgetGalaxy(c, { THREE: FakeTHREE }, { widgets: sample, onHover: (w) => { last = w } })
    FakeRaycaster.next = true
    c.dispatch('pointermove', { clientX: 1, clientY: 1 })
    c.dispatch('pointerleave')
    expect(last).toBe(null)
  })

  test('OrbitControls created when provided', () => {
    let constructed = false
    const Controls = function () { constructed = true; this.update = () => {}; this.enableDamping = false; this.autoRotate = false }
    createWidgetGalaxy(fakeCanvas(), { THREE: FakeTHREE, OrbitControls: Controls }, { widgets: sample })
    expect(constructed).toBe(true)
  })

  test('destroy disposes resources', () => {
    const g = createWidgetGalaxy(fakeCanvas(), { THREE: FakeTHREE }, { widgets: sample })
    g.destroy()
    expect(g.cubes.every((c) => c.mesh.geometry.disposed)).toBe(true)
  })

  test('resize updates camera and renderer', () => {
    const c = fakeCanvas(800, 600)
    const g = createWidgetGalaxy(c, { THREE: FakeTHREE }, { widgets: sample })
    c.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, height: 500 })
    g.resize()
    expect(g.camera.aspect).toBeCloseTo(2)
  })
})
