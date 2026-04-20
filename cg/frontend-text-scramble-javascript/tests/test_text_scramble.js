import { TextScramble, defineTextScramble } from '../src/text_scramble.js'

globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)

defineTextScramble('text-scramble')

function flush(ms = 30) { return new Promise((r) => setTimeout(r, ms)) }

describe('TextScramble', () => {
  test('attaches shadow root with output span', () => {
    const el = document.createElement('text-scramble')
    expect(el.shadowRoot.querySelector('.output')).toBeTruthy()
  })

  test('default charset is provided', () => {
    const el = document.createElement('text-scramble')
    expect(typeof el.charset).toBe('string')
    expect(el.charset.length).toBeGreaterThan(0)
  })

  test('honors charset attribute', () => {
    const el = document.createElement('text-scramble')
    el.setAttribute('charset', 'ABC')
    expect(el.charset).toBe('ABC')
  })

  test('default speed is 1', () => {
    const el = document.createElement('text-scramble')
    expect(el.speed).toBe(1)
  })

  test('honors speed attribute', () => {
    const el = document.createElement('text-scramble')
    el.setAttribute('speed', '4')
    expect(el.speed).toBe(4)
  })

  test('rejects invalid speed', () => {
    const el = document.createElement('text-scramble')
    el.setAttribute('speed', 'abc')
    expect(el.speed).toBe(1)
  })

  test('text setter updates the attribute', () => {
    const el = document.createElement('text-scramble')
    el.text = 'hi'
    expect(el.getAttribute('text')).toBe('hi')
  })

  test('renders text content as the target', async () => {
    const el = document.createElement('text-scramble')
    el.textContent = 'hello'
    document.body.appendChild(el)
    expect(el.getAttribute('text')).toBe('hello')
    el.remove()
  })

  test('text attribute renders directly when not autoplay', () => {
    const el = document.createElement('text-scramble')
    el.setAttribute('text', 'hello')
    document.body.appendChild(el)
    expect(el.shadowRoot.querySelector('.output').textContent).toBe('hello')
    el.remove()
  })

  test('attribute change re-renders when not autoplay', () => {
    const el = document.createElement('text-scramble')
    el.setAttribute('text', 'one')
    document.body.appendChild(el)
    el.setAttribute('text', 'two')
    expect(el.shadowRoot.querySelector('.output').textContent).toBe('two')
    el.remove()
  })

  test('autoplay triggers play on connect', async () => {
    const el = document.createElement('text-scramble')
    el.setAttribute('text', 'a')
    el.setAttribute('autoplay', '')
    el.setAttribute('speed', '50')
    document.body.appendChild(el)
    await flush(200)
    expect(el.shadowRoot.querySelector('.output').textContent).toBe('a')
    el.remove()
  })

  test('play returns a promise that resolves when settled', async () => {
    const el = document.createElement('text-scramble')
    el.setAttribute('speed', '50')
    document.body.appendChild(el)
    await el.play('done')
    expect(el.shadowRoot.querySelector('.output').textContent).toBe('done')
    el.remove()
  })

  test('play with no arg uses text attribute', async () => {
    const el = document.createElement('text-scramble')
    el.setAttribute('text', 'hi')
    el.setAttribute('speed', '50')
    document.body.appendChild(el)
    await el.play()
    expect(el.shadowRoot.querySelector('.output').textContent).toBe('hi')
    el.remove()
  })

  test('subsequent play replaces target', async () => {
    const el = document.createElement('text-scramble')
    el.setAttribute('speed', '50')
    document.body.appendChild(el)
    await el.play('one')
    await el.play('two')
    expect(el.shadowRoot.querySelector('.output').textContent).toBe('two')
    el.remove()
  })

  test('disconnect cancels in-progress animation', () => {
    const el = document.createElement('text-scramble')
    el.setAttribute('speed', '0.1')
    document.body.appendChild(el)
    el.play('long target text here')
    expect(() => el.remove()).not.toThrow()
  })

  test('defineTextScramble is idempotent', () => {
    defineTextScramble('text-scramble')
    defineTextScramble('text-scramble')
    expect(customElements.get('text-scramble')).toBe(TextScramble)
  })
})
