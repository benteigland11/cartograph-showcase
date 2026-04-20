function rand(min, max) { return min + Math.random() * (max - min) }

function createParticles(count, width, height, opts) {
  const particles = []
  for (let i = 0; i < count; i++) {
    const size = rand(opts.minSize, opts.maxSize)
    particles.push({
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(-opts.speed, opts.speed),
      vy: rand(-opts.speed, opts.speed) * 0.5 - opts.drift,
      size,
      radius: size * 0.2,
      color: opts.colors[Math.floor(Math.random() * opts.colors.length)],
      alpha: rand(opts.minAlpha, opts.maxAlpha),
      rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(-0.003, 0.003),
    })
  }
  return particles
}

function step(particle, width, height) {
  particle.x += particle.vx
  particle.y += particle.vy
  particle.rotation += particle.rotationSpeed
  if (particle.x < -particle.size) particle.x = width + particle.size
  if (particle.x > width + particle.size) particle.x = -particle.size
  if (particle.y < -particle.size) particle.y = height + particle.size
  if (particle.y > height + particle.size) particle.y = -particle.size
}

function drawParticle(ctx, p) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)
  ctx.globalAlpha = p.alpha
  ctx.fillStyle = p.color
  const half = p.size / 2
  const r = p.radius
  ctx.beginPath()
  ctx.moveTo(-half + r, -half)
  ctx.arcTo(half, -half, half, half, r)
  ctx.arcTo(half, half, -half, half, r)
  ctx.arcTo(-half, half, -half, -half, r)
  ctx.arcTo(-half, -half, half, -half, r)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

const DEFAULTS = {
  count: 24,
  colors: ['#FFEA00', '#FFC300', '#FF9500'],
  minSize: 4,
  maxSize: 14,
  minAlpha: 0.18,
  maxAlpha: 0.55,
  speed: 0.18,
  drift: 0.05,
  respectReducedMotion: true,
  dpr: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1,
}

export function createParticleField(canvas, options = {}) {
  if (!canvas || !canvas.getContext) throw new TypeError('canvas must be a canvas element')
  const opts = { ...DEFAULTS, ...options }
  const ctx = canvas.getContext('2d')

  const reducedMotion = opts.respectReducedMotion && typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-reduced-motion: reduce)').matches

  let width = 0, height = 0, particles = [], raf = null, running = false

  function resize() {
    const rect = canvas.getBoundingClientRect()
    width = Math.max(1, rect.width)
    height = Math.max(1, rect.height)
    canvas.width = width * opts.dpr
    canvas.height = height * opts.dpr
    ctx.setTransform(opts.dpr, 0, 0, opts.dpr, 0, 0)
    if (particles.length === 0) particles = createParticles(opts.count, width, height, opts)
  }

  function frame() {
    if (!running) return
    ctx.clearRect(0, 0, width, height)
    for (const p of particles) {
      step(p, width, height)
      drawParticle(ctx, p)
    }
    raf = requestAnimationFrame(frame)
  }

  function paintStatic() {
    ctx.clearRect(0, 0, width, height)
    for (const p of particles) drawParticle(ctx, p)
  }

  resize()

  if (reducedMotion) {
    paintStatic()
  }

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
    destroy() {
      this.stop()
      particles = []
    },
    get particles() { return particles },
    get reducedMotion() { return reducedMotion },
  }
}
