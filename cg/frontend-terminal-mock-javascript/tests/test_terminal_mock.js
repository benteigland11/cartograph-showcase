import { TerminalMock, defineTerminalMock } from '../src/terminal_mock.js'

globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)

defineTerminalMock('terminal-mock')

function flush(ms = 50) { return new Promise(r => setTimeout(r, ms)) }

describe('TerminalMock', () => {
  test('attaches shadow root and chrome', () => {
    const el = document.createElement('terminal-mock')
    expect(el.shadowRoot.querySelector('.window')).toBeTruthy()
    expect(el.shadowRoot.querySelector('.chrome')).toBeTruthy()
    expect(el.shadowRoot.querySelectorAll('.dot').length).toBe(3)
  })

  test('renders a screen for output', () => {
    const el = document.createElement('terminal-mock')
    expect(el.shadowRoot.querySelector('.screen')).toBeTruthy()
  })

  test('lines setter rejects non-array', () => {
    const el = document.createElement('terminal-mock')
    expect(() => { el.lines = 'nope' }).toThrow(TypeError)
  })

  test('lines getter returns set value', () => {
    const el = document.createElement('terminal-mock')
    el.lines = [{ text: 'ls' }]
    expect(el.lines).toEqual([{ text: 'ls' }])
  })

  test('parses lines attribute as JSON', () => {
    const el = document.createElement('terminal-mock')
    el.setAttribute('lines', JSON.stringify([{ text: 'ls' }]))
    document.body.appendChild(el)
    expect(el.lines.length).toBe(1)
    el.remove()
  })

  test('ignores invalid lines attribute JSON', () => {
    const el = document.createElement('terminal-mock')
    el.setAttribute('lines', 'not json')
    document.body.appendChild(el)
    expect(el.lines).toEqual([])
    el.remove()
  })

  test('speed defaults to 35 when missing or invalid', () => {
    const el = document.createElement('terminal-mock')
    expect(el.speed).toBe(35)
    el.setAttribute('speed', 'abc')
    expect(el.speed).toBe(35)
    el.setAttribute('speed', '10')
    expect(el.speed).toBe(10)
  })

  test('play renders an output line and emits complete', async () => {
    const el = document.createElement('terminal-mock')
    document.body.appendChild(el)
    el.lines = [{ output: 'done', delay: 0 }]
    let completed = false
    el.addEventListener('terminal-complete', () => { completed = true })
    el.play()
    await flush(50)
    expect(el.shadowRoot.querySelector('.output').textContent).toContain('done')
    expect(completed).toBe(true)
    expect(el.shadowRoot.querySelector('.cursor')).toBeTruthy()
    el.remove()
  })

  test('play types a command line character by character', async () => {
    const el = document.createElement('terminal-mock')
    document.body.appendChild(el)
    el.setAttribute('speed', '1')
    el.lines = [{ prompt: '> ', text: 'hi' }]
    el.play()
    await flush(100)
    const screen = el.shadowRoot.querySelector('.screen')
    expect(screen.querySelector('.prompt').textContent).toBe('> ')
    expect(screen.textContent).toContain('hi')
    el.remove()
  })

  test('autoplay attribute triggers play on connect', async () => {
    const el = document.createElement('terminal-mock')
    el.setAttribute('autoplay', '')
    el.lines = [{ output: 'auto' }]
    document.body.appendChild(el)
    await flush(50)
    expect(el.shadowRoot.querySelector('.output').textContent).toContain('auto')
    el.remove()
  })

  test('disconnect stops pending timers', async () => {
    const el = document.createElement('terminal-mock')
    document.body.appendChild(el)
    el.setAttribute('speed', '1')
    el.lines = [{ text: 'hello world this is long' }]
    el.play()
    el.remove()
    await flush(20)
  })

  test('default prompt is $', async () => {
    const el = document.createElement('terminal-mock')
    document.body.appendChild(el)
    el.setAttribute('speed', '1')
    el.lines = [{ text: 'x' }]
    el.play()
    await flush(50)
    expect(el.shadowRoot.querySelector('.prompt').textContent).toBe('$ ')
    el.remove()
  })

  test('multiple lines play sequentially', async () => {
    const el = document.createElement('terminal-mock')
    document.body.appendChild(el)
    el.setAttribute('speed', '1')
    el.lines = [
      { text: 'a', delay: 5 },
      { output: 'b' },
    ]
    el.play()
    await flush(100)
    expect(el.shadowRoot.querySelectorAll('.line').length).toBe(2)
    el.remove()
  })

  test('defineTerminalMock is idempotent', () => {
    defineTerminalMock('terminal-mock')
    defineTerminalMock('terminal-mock')
    expect(customElements.get('terminal-mock')).toBe(TerminalMock)
  })
})
