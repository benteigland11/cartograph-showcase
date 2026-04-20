const DEFAULTS = {
  nodes: [],
  edges: [],
  nodeColor: '#FFC300',
  edgeColor: 'rgba(255, 255, 255, 0.08)',
  edgeColorActive: 'rgba(255, 195, 0, 0.6)',
  labelColor: '#f0f2f8',
  labelMutedColor: 'rgba(240, 242, 248, 0.4)',
  background: '#06070b',
  baseRadius: 5,
  radiusScale: 6,
  repulsion: 1400,
  springLength: 90,
  springStrength: 0.02,
  centerStrength: 0.005,
  damping: 0.86,
  showLabels: true,
}

function rand(min, max) { return min + Math.random() * (max - min) }

export function createGraphViewer(canvas, options = {}) {
  if (!canvas || !canvas.getContext) throw new TypeError('canvas must be a canvas element')
  const opts = { ...DEFAULTS, ...options }
  const ctx = canvas.getContext('2d')

  let width = 0, height = 0, raf = null, running = false
  let nodes = [], edges = [], adjacency = new Map()
  let dragging = null
  let hovered = null

  function resize() {
    const rect = canvas.getBoundingClientRect()
    width = Math.max(1, rect.width)
    height = Math.max(1, rect.height)
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function setData(rawNodes, rawEdges) {
    nodes = rawNodes.map((n, i) => ({
      id: n.id ?? String(i),
      label: n.label ?? n.id ?? '',
      color: n.color ?? opts.nodeColor,
      weight: n.weight ?? 1,
      data: n,
      x: n.x ?? rand(width * 0.3, width * 0.7),
      y: n.y ?? rand(height * 0.3, height * 0.7),
      vx: 0, vy: 0,
      r: opts.baseRadius + Math.sqrt(n.weight ?? 1) * opts.radiusScale * 0.4,
    }))
    const idIndex = new Map(nodes.map((n, i) => [n.id, i]))
    edges = rawEdges
      .map((e) => ({ source: idIndex.get(e.source), target: idIndex.get(e.target), data: e }))
      .filter((e) => e.source != null && e.target != null && e.source !== e.target)
    adjacency.clear()
    for (const e of edges) {
      if (!adjacency.has(e.source)) adjacency.set(e.source, new Set())
      if (!adjacency.has(e.target)) adjacency.set(e.target, new Set())
      adjacency.get(e.source).add(e.target)
      adjacency.get(e.target).add(e.source)
    }
  }

  setData(opts.nodes, opts.edges)

  function step() {
    const cx = width / 2, cy = height / 2
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]
      let fx = (cx - a.x) * opts.centerStrength
      let fy = (cy - a.y) * opts.centerStrength
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue
        const b = nodes[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist2 = dx * dx + dy * dy + 0.01
        const force = opts.repulsion / dist2
        fx += (dx / Math.sqrt(dist2)) * force
        fy += (dy / Math.sqrt(dist2)) * force
      }
      a.vx = (a.vx + fx) * opts.damping
      a.vy = (a.vy + fy) * opts.damping
    }
    for (const e of edges) {
      const a = nodes[e.source], b = nodes[e.target]
      const dx = b.x - a.x, dy = b.y - a.y
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001
      const diff = (dist - opts.springLength) * opts.springStrength
      const fx = (dx / dist) * diff
      const fy = (dy / dist) * diff
      a.vx += fx; a.vy += fy
      b.vx -= fx; b.vy -= fy
    }
    for (const n of nodes) {
      if (n === dragging) continue
      n.x += n.vx
      n.y += n.vy
    }
  }

  function draw() {
    ctx.fillStyle = opts.background
    ctx.fillRect(0, 0, width, height)

    const activeNeighbors = hovered != null ? adjacency.get(hovered) ?? new Set() : null
    ctx.lineWidth = 1
    for (const e of edges) {
      const a = nodes[e.source], b = nodes[e.target]
      const isActive = activeNeighbors && (e.source === hovered || e.target === hovered)
      ctx.strokeStyle = isActive ? opts.edgeColorActive : opts.edgeColor
      ctx.lineWidth = isActive ? 1.5 : 1
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      const dim = activeNeighbors && i !== hovered && !activeNeighbors.has(i)
      ctx.globalAlpha = dim ? 0.25 : 1
      ctx.fillStyle = n.color
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
      ctx.fill()
      if (opts.showLabels && n.label) {
        ctx.font = '11px ui-monospace, monospace'
        ctx.fillStyle = i === hovered ? opts.labelColor : opts.labelMutedColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(n.label, n.x, n.y + n.r + 4)
      }
      ctx.globalAlpha = 1
    }
  }

  function frame() {
    if (!running) return
    step()
    draw()
    raf = requestAnimationFrame(frame)
  }

  function pickNode(x, y) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]
      const dx = n.x - x, dy = n.y - y
      if (dx * dx + dy * dy <= n.r * n.r * 4) return i
    }
    return null
  }

  function pointer(e) {
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function onPointerDown(e) {
    const { x, y } = pointer(e)
    const idx = pickNode(x, y)
    if (idx != null) {
      dragging = nodes[idx]
      canvas.setPointerCapture?.(e.pointerId)
    }
  }
  function onPointerMove(e) {
    const { x, y } = pointer(e)
    if (dragging) {
      dragging.x = x; dragging.y = y; dragging.vx = 0; dragging.vy = 0
    } else {
      const idx = pickNode(x, y)
      if (idx !== hovered) {
        hovered = idx
        canvas.style.cursor = idx != null ? 'pointer' : 'grab'
      }
    }
  }
  function onPointerUp(e) {
    if (dragging) {
      canvas.releasePointerCapture?.(e.pointerId)
      dragging = null
    }
  }
  function onPointerLeave() {
    hovered = null
    canvas.style.cursor = 'grab'
  }

  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)
  canvas.addEventListener('pointerleave', onPointerLeave)

  resize()

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
    setData,
    resize,
    destroy() {
      this.stop()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      nodes = []
      edges = []
    },
    get nodes() { return nodes },
    get edges() { return edges },
    get hovered() { return hovered },
  }
}
