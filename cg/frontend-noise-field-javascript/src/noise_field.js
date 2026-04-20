function hash2(x, y) {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

function smoothstep(t) { return t * t * (3 - 2 * t) }

export function valueNoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y)
  const xf = x - xi, yf = y - yi
  const a = hash2(xi, yi)
  const b = hash2(xi + 1, yi)
  const c = hash2(xi, yi + 1)
  const d = hash2(xi + 1, yi + 1)
  const u = smoothstep(xf)
  const v = smoothstep(yf)
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v
}

const DEFAULTS = {
  count: 220,
  colors: ['#FFEA00', '#FFC300', '#FF9500'],
  background: 'rgba(6, 7, 11, 0.08)',
  scale: 0.0035,
  speed: 1.4,
  lineWidth: 0.9,
  alpha: 0.55,
  drift: 0.005,
  respectReducedMotion: true,
}

function rand(min, max) { return min + Math.random() * (max - min) }

export function createNoiseField(canvas, options = {}) {
  if (!canvas || !canvas.getContext) throw new TypeError('canvas must be a canvas element')
  const opts = { ...DEFAULTS, ...options }
  const ctx = canvas.getContext('2d')

  const reducedMotion = opts.respectReducedMotion && typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-reduced-motion: reduce)').matches

  let particles = []
  let width = 0, height = 0, raf = null, running = false, t = 0

  function resize() {
    const rect = canvas.getBoundingClientRect()
    width = Math.max(1, rect.width)
    height = Math.max(1, rect.height)
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (particles.length === 0) seed()
    ctx.fillStyle = '#06070b'
    ctx.fillRect(0, 0, width, height)
  }

  function seed() {
    particles = []
    for (let i = 0; i < opts.count; i++) {
      particles.push({
        x: rand(0, width),
        y: rand(0, height),
        color: opts.colors[Math.floor(Math.random() * opts.colors.length)],
        life: rand(80, 240),
        age: 0,
      })
    }
  }

  function angleAt(x, y) {
    const n = valueNoise(x * opts.scale, y * opts.scale + t * opts.drift)
    return n * Math.PI * 4
  }

  function frame() {
    if (!running) return
    ctx.fillStyle = opts.background
    ctx.fillRect(0, 0, width, height)
    ctx.lineWidth = opts.lineWidth
    ctx.lineCap = 'round'
    ctx.globalAlpha = opts.alpha
    for (const p of particles) {
      const a = angleAt(p.x, p.y)
      const nx = p.x + Math.cos(a) * opts.speed
      const ny = p.y + Math.sin(a) * opts.speed
      ctx.strokeStyle = p.color
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(nx, ny)
      ctx.stroke()
      p.x = nx
      p.y = ny
      p.age++
      if (p.age > p.life || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
        p.x = rand(0, width)
        p.y = rand(0, height)
        p.age = 0
      }
    }
    ctx.globalAlpha = 1
    t++
    raf = requestAnimationFrame(frame)
  }

  function paintOnce() {
    ctx.fillStyle = '#06070b'
    ctx.fillRect(0, 0, width, height)
    for (const p of particles) {
      ctx.fillStyle = p.color
      ctx.fillRect(p.x, p.y, opts.lineWidth * 2, opts.lineWidth * 2)
    }
  }

  resize()
  if (reducedMotion) paintOnce()

  return {
    start() {
      if (running || reducedMotion) return
      running = true
      raf = requestAnimationFrame(frame)
    },
    stop() {
      running = false
      if (raf != null) cancelAnimationFrame(raf)
      raf = null
    },
    resize,
    seed,
    destroy() {
      this.stop()
      particles = []
    },
    get particles() { return particles },
    get reducedMotion() { return reducedMotion },
  }
}
