import { initScrollReveal, injectRevealStyles, REVEAL_CSS } from '../src/scroll_reveal.js'

class MockObserver {
  static instances = []
  constructor(callback, options) {
    this.callback = callback
    this.options = options
    this.observed = new Set()
    MockObserver.instances.push(this)
  }
  observe(el) { this.observed.add(el) }
  unobserve(el) { this.observed.delete(el) }
  disconnect() { this.observed.clear() }
  trigger(entries) { this.callback(entries) }
}

describe('initScrollReveal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    MockObserver.instances = []
    globalThis.IntersectionObserver = MockObserver
  })

  test('observes elements matching the default selector', () => {
    document.body.innerHTML = '<div data-reveal></div><div data-reveal></div><span></span>'
    initScrollReveal()
    const obs = MockObserver.instances[0]
    expect(obs.observed.size).toBe(2)
  })

  test('uses custom selector', () => {
    document.body.innerHTML = '<div class="fade"></div><div class="fade"></div>'
    initScrollReveal({ selector: '.fade' })
    const obs = MockObserver.instances[0]
    expect(obs.observed.size).toBe(2)
  })

  test('adds revealed class on intersection', () => {
    const el = document.createElement('div')
    el.setAttribute('data-reveal', '')
    document.body.appendChild(el)
    initScrollReveal()
    const obs = MockObserver.instances[0]
    obs.trigger([{ isIntersecting: true, target: el }])
    expect(el.classList.contains('is-revealed')).toBe(true)
  })

  test('uses custom revealed class', () => {
    const el = document.createElement('div')
    el.setAttribute('data-reveal', '')
    document.body.appendChild(el)
    initScrollReveal({ revealedClass: 'shown' })
    const obs = MockObserver.instances[0]
    obs.trigger([{ isIntersecting: true, target: el }])
    expect(el.classList.contains('shown')).toBe(true)
  })

  test('once=true unobserves after revealing', () => {
    const el = document.createElement('div')
    el.setAttribute('data-reveal', '')
    document.body.appendChild(el)
    initScrollReveal()
    const obs = MockObserver.instances[0]
    obs.trigger([{ isIntersecting: true, target: el }])
    expect(obs.observed.has(el)).toBe(false)
  })

  test('once=false removes class on exit', () => {
    const el = document.createElement('div')
    el.setAttribute('data-reveal', '')
    document.body.appendChild(el)
    initScrollReveal({ once: false })
    const obs = MockObserver.instances[0]
    obs.trigger([{ isIntersecting: true, target: el }])
    expect(el.classList.contains('is-revealed')).toBe(true)
    obs.trigger([{ isIntersecting: false, target: el }])
    expect(el.classList.contains('is-revealed')).toBe(false)
    expect(obs.observed.has(el)).toBe(true)
  })

  test('returns a controller with disconnect and observe', () => {
    const controller = initScrollReveal()
    expect(typeof controller.disconnect).toBe('function')
    expect(typeof controller.observe).toBe('function')
    const newEl = document.createElement('div')
    controller.observe(newEl)
    expect(MockObserver.instances[0].observed.has(newEl)).toBe(true)
    controller.disconnect()
    expect(MockObserver.instances[0].observed.size).toBe(0)
  })

  test('falls back to revealing all when IntersectionObserver missing', () => {
    delete globalThis.IntersectionObserver
    const a = document.createElement('div')
    const b = document.createElement('div')
    a.setAttribute('data-reveal', '')
    b.setAttribute('data-reveal', '')
    document.body.append(a, b)
    const controller = initScrollReveal()
    expect(a.classList.contains('is-revealed')).toBe(true)
    expect(b.classList.contains('is-revealed')).toBe(true)
    expect(typeof controller.disconnect).toBe('function')
  })
})

describe('injectRevealStyles', () => {
  beforeEach(() => { document.head.innerHTML = '' })

  test('injects a style tag with reveal CSS', () => {
    injectRevealStyles()
    const style = document.getElementById('scroll-reveal-styles')
    expect(style).toBeTruthy()
    expect(style.textContent).toContain('[data-reveal]')
  })

  test('does not duplicate if already present', () => {
    injectRevealStyles()
    injectRevealStyles()
    expect(document.querySelectorAll('#scroll-reveal-styles').length).toBe(1)
  })

  test('honors custom id', () => {
    injectRevealStyles('my-styles')
    expect(document.getElementById('my-styles')).toBeTruthy()
  })
})

describe('REVEAL_CSS', () => {
  test('exports the css string', () => {
    expect(REVEAL_CSS).toContain('[data-reveal]')
    expect(REVEAL_CSS).toContain('is-revealed')
  })
})
