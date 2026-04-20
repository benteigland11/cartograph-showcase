import { StatsCounter, defineStatsCounter } from '../src/stats_counter.js'

globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)

defineStatsCounter('stats-counter')

function flush(ms = 30) { return new Promise((r) => setTimeout(r, ms)) }

class MockObserver {
  static instances = []
  constructor(cb) { this.cb = cb; MockObserver.instances.push(this) }
  observe(el) { this.target = el }
  disconnect() {}
  trigger(intersecting) { this.cb([{ isIntersecting: intersecting, target: this.target }]) }
}

describe('StatsCounter', () => {
  beforeEach(() => {
    MockObserver.instances = []
    globalThis.IntersectionObserver = MockObserver
  })

  test('attaches shadow root with value span', () => {
    const el = document.createElement('stats-counter')
    expect(el.shadowRoot.querySelector('.value')).toBeTruthy()
  })

  test('default target is 0', () => {
    const el = document.createElement('stats-counter')
    expect(el.target).toBe(0)
  })

  test('honors target attribute', () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('target', '1234')
    expect(el.target).toBe(1234)
  })

  test('target setter updates the attribute', () => {
    const el = document.createElement('stats-counter')
    el.target = 99
    expect(el.getAttribute('target')).toBe('99')
  })

  test('default duration is 1600', () => {
    const el = document.createElement('stats-counter')
    expect(el.duration).toBe(1600)
  })

  test('honors duration attribute', () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('duration', '500')
    expect(el.duration).toBe(500)
  })

  test('rejects invalid duration', () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('duration', 'abc')
    expect(el.duration).toBe(1600)
  })

  test('default decimals is 0', () => {
    const el = document.createElement('stats-counter')
    expect(el.decimals).toBe(0)
  })

  test('honors decimals attribute', () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('decimals', '2')
    expect(el.decimals).toBe(2)
  })

  test('renders 0 on connect', () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('target', '500')
    document.body.appendChild(el)
    expect(el.shadowRoot.querySelector('.value').textContent).toBe('0')
    el.remove()
  })

  test('autoplay triggers play immediately', async () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('target', '100')
    el.setAttribute('duration', '20')
    el.setAttribute('autoplay', '')
    document.body.appendChild(el)
    await flush(80)
    expect(el.shadowRoot.querySelector('.value').textContent).toBe('100')
    el.remove()
  })

  test('observes intersection when not autoplay', () => {
    const el = document.createElement('stats-counter')
    document.body.appendChild(el)
    expect(MockObserver.instances.length).toBe(1)
    el.remove()
  })

  test('intersection triggers play', async () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('target', '50')
    el.setAttribute('duration', '20')
    document.body.appendChild(el)
    MockObserver.instances[0].trigger(true)
    await flush(80)
    expect(el.shadowRoot.querySelector('.value').textContent).toBe('50')
    el.remove()
  })

  test('non-intersecting entry is ignored', async () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('target', '50')
    el.setAttribute('duration', '20')
    document.body.appendChild(el)
    MockObserver.instances[0].trigger(false)
    await flush(50)
    expect(el.shadowRoot.querySelector('.value').textContent).toBe('0')
    el.remove()
  })

  test('formatter override controls display', () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('target', '500')
    el.formatter = (n) => `~${Math.round(n)}~`
    document.body.appendChild(el)
    expect(el.shadowRoot.querySelector('.value').textContent).toBe('~0~')
    el.remove()
  })

  test('formatter setter rejects non-function', () => {
    const el = document.createElement('stats-counter')
    expect(() => { el.formatter = 'no' }).toThrow(TypeError)
  })

  test('prefix and suffix wrap formatted value', () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('target', '1500')
    el.setAttribute('prefix', '$')
    el.setAttribute('suffix', '+')
    el.setAttribute('autoplay', '')
    el.setAttribute('duration', '10')
    document.body.appendChild(el)
    return flush(50).then(() => {
      expect(el.shadowRoot.querySelector('.value').textContent).toBe('$1,500+')
      el.remove()
    })
  })

  test('decimals show fractional output', async () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('target', '4.567')
    el.setAttribute('decimals', '2')
    el.setAttribute('autoplay', '')
    el.setAttribute('duration', '10')
    document.body.appendChild(el)
    await flush(50)
    expect(el.shadowRoot.querySelector('.value').textContent).toBe('4.57')
    el.remove()
  })

  test('emits counter-complete on finish', async () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('target', '5')
    el.setAttribute('autoplay', '')
    el.setAttribute('duration', '10')
    document.body.appendChild(el)
    let done = false
    el.addEventListener('counter-complete', () => { done = true })
    await flush(50)
    expect(done).toBe(true)
    el.remove()
  })

  test('disconnect cancels animation', () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('target', '500')
    el.setAttribute('autoplay', '')
    document.body.appendChild(el)
    expect(() => el.remove()).not.toThrow()
  })

  test('falls back to immediate play when IntersectionObserver missing', async () => {
    delete globalThis.IntersectionObserver
    const el = document.createElement('stats-counter')
    el.setAttribute('target', '20')
    el.setAttribute('duration', '10')
    document.body.appendChild(el)
    await flush(50)
    expect(el.shadowRoot.querySelector('.value').textContent).toBe('20')
    el.remove()
  })

  test('attribute change re-renders', () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('target', '100')
    document.body.appendChild(el)
    el.setAttribute('target', '500')
    expect(el.shadowRoot.querySelector('.value').textContent).toBe('500')
    el.remove()
  })

  test('linear easing option', () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('easing', 'linear')
    expect(el.easing(0.5)).toBe(0.5)
  })

  test('ease-in-out easing option', () => {
    const el = document.createElement('stats-counter')
    el.setAttribute('easing', 'ease-in-out')
    expect(el.easing(0.5)).toBe(0.5)
  })

  test('defineStatsCounter is idempotent', () => {
    defineStatsCounter('stats-counter')
    defineStatsCounter('stats-counter')
    expect(customElements.get('stats-counter')).toBe(StatsCounter)
  })
})
