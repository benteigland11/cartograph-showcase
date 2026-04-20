import './_setup_dom.js'
import { createWidgetGalaxy } from '../src/widget_galaxy.js'

class V { constructor() {} set() {} }
const FakeTHREE = {
  Scene: class { add() {} children = [] },
  Color: class {}, Fog: class {},
  PerspectiveCamera: class { constructor() { this.position = { set: () => {} } } updateProjectionMatrix() {} },
  WebGLRenderer: class { setPixelRatio() {} setSize() {} render() {} dispose() {} },
  AmbientLight: class {},
  DirectionalLight: class { constructor() { this.position = { set: () => {} } } },
  Group: class { children = []; rotation = { y: 0 }; add() {} remove() {} },
  BoxGeometry: class { dispose() {} },
  MeshStandardMaterial: class { constructor(o) { Object.assign(this, o) } dispose() {} },
  Mesh: class { constructor(g, m) { this.geometry = g; this.material = m; this.position = { set: () => {} }; this.userData = {} } },
  Raycaster: class { setFromCamera() {} intersectObjects() { return [] } },
  Vector2: class {},
}

const fakeCanvas = {
  getContext: () => ({}),
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
  addEventListener: () => {}, removeEventListener: () => {},
  style: {},
}

const galaxy = createWidgetGalaxy(fakeCanvas, { THREE: FakeTHREE }, {
  widgets: [
    { id: 'sample-one', domain: 'frontend', install_count: 100 },
    { id: 'sample-two', domain: 'backend', install_count: 50 },
  ],
})

console.log('cubes built:', galaxy.cubes.length)
galaxy.setWidgets([{ id: 'just-one', domain: 'data', install_count: 0 }])
console.log('after setWidgets:', galaxy.cubes.length)
galaxy.destroy()
