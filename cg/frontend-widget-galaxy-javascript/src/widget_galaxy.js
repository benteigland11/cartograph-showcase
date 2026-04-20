const DEFAULT_DOMAIN_COLORS = {
  frontend: 0xFFC300,
  backend: 0xFF9500,
  universal: 0xFFEA00,
  data: 0x7dd3fc,
  ml: 0xc4b5fd,
  security: 0xf87171,
  infra: 0x9ca3af,
  modeling: 0x4ade80,
  rtl: 0xfb7185,
  default: 0xFFC300,
}

function pickColor(colors, domain) {
  return colors[domain] ?? colors.default ?? 0xFFC300
}

function fibSphere(count, radius) {
  const points = []
  const phi = Math.PI * (Math.sqrt(5) - 1)
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = phi * i
    points.push([Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius])
  }
  return points
}

function sizeFor(installs, base, scale) {
  const k = Math.log10(Math.max(1, installs ?? 0) + 1)
  return base + k * scale
}

export function createWidgetGalaxy(canvas, deps, opts = {}) {
  if (!canvas || !canvas.getContext) throw new TypeError('canvas must be a canvas element')
  const { THREE, OrbitControls } = deps || {}
  if (!THREE) throw new TypeError('deps.THREE is required')

  const options = {
    widgets: [],
    radius: 14,
    cubeBase: 0.5,
    cubeScale: 0.45,
    background: 0x06070b,
    domainColors: DEFAULT_DOMAIN_COLORS,
    autoRotateSpeed: 0.35,
    cameraDistance: 26,
    onHover: null,
    onSelect: null,
    ...opts,
  }

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(options.background)
  scene.fog = new THREE.Fog(options.background, options.cameraDistance, options.cameraDistance * 2.2)

  const initial = canvas.getBoundingClientRect()
  const width = Math.max(1, initial.width)
  const height = Math.max(1, initial.height)

  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 200)
  camera.position.set(0, 0, options.cameraDistance)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height, false)

  const ambient = new THREE.AmbientLight(0xffffff, 0.45)
  const key = new THREE.DirectionalLight(0xffffff, 0.85)
  key.position.set(5, 8, 10)
  scene.add(ambient, key)

  let controls = null
  if (OrbitControls) {
    controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.minDistance = 12
    controls.maxDistance = 50
    controls.autoRotate = true
    controls.autoRotateSpeed = options.autoRotateSpeed
  }

  const cubes = []
  const cubeGroup = new THREE.Group()
  scene.add(cubeGroup)

  function build(widgets) {
    cubes.forEach((c) => { cubeGroup.remove(c.mesh); c.mesh.geometry.dispose(); c.mesh.material.dispose() })
    cubes.length = 0
    const positions = fibSphere(widgets.length, options.radius)
    widgets.forEach((w, i) => {
      const size = sizeFor(w.install_count, options.cubeBase, options.cubeScale)
      const geometry = new THREE.BoxGeometry(size, size, size)
      const color = pickColor(options.domainColors, w.domain)
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.25,
        roughness: 0.4,
        metalness: 0.15,
      })
      const mesh = new THREE.Mesh(geometry, material)
      const [x, y, z] = positions[i]
      mesh.position.set(x, y, z)
      mesh.userData = { widget: w, index: i, baseEmissive: 0.25 }
      cubeGroup.add(mesh)
      cubes.push({ mesh, widget: w })
    })
  }

  build(options.widgets)

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let hovered = null

  function setHover(mesh) {
    if (hovered === mesh) return
    if (hovered) hovered.material.emissiveIntensity = hovered.userData.baseEmissive
    hovered = mesh
    if (mesh) {
      mesh.material.emissiveIntensity = 0.85
      canvas.style.cursor = 'pointer'
    } else {
      canvas.style.cursor = 'grab'
    }
    if (typeof options.onHover === 'function') {
      options.onHover(mesh ? mesh.userData.widget : null)
    }
  }

  function pointerCoords(e) {
    const rect = canvas.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  }

  function intersect() {
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(cubeGroup.children, false)
    return hits.length ? hits[0].object : null
  }

  function onPointerMove(e) { pointerCoords(e); setHover(intersect()) }
  function onPointerLeave() { setHover(null) }
  function onClick(e) {
    pointerCoords(e)
    const hit = intersect()
    if (hit && typeof options.onSelect === 'function') {
      options.onSelect(hit.userData.widget)
    }
  }

  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerleave', onPointerLeave)
  canvas.addEventListener('click', onClick)

  let raf = null
  let running = false

  function frame() {
    if (!running) return
    if (controls) controls.update()
    cubeGroup.rotation.y += 0.0008
    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    const w = Math.max(1, rect.width)
    const h = Math.max(1, rect.height)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  return {
    start() {
      if (running) return
      running = true
      raf = requestAnimationFrame(frame)
    },
    stop() {
      running = false
      if (raf != null) cancelAnimationFrame(raf)
      raf = null
    },
    setWidgets(widgets) { build(widgets) },
    resize,
    destroy() {
      this.stop()
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('click', onClick)
      cubes.forEach((c) => { c.mesh.geometry.dispose(); c.mesh.material.dispose() })
      renderer.dispose()
    },
    get cubes() { return cubes },
    get scene() { return scene },
    get camera() { return camera },
  }
}

export const DOMAIN_COLORS = DEFAULT_DOMAIN_COLORS
