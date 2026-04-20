import { buildLoadFadeCss, injectLoadFadeStyles, markReady, whenReady } from '../src/page_load_fade.js'

describe('buildLoadFadeCss', () => {
  test('returns a string with default values', () => {
    const css = buildLoadFadeCss()
    expect(css).toContain('background: #0a0b10')
    expect(css).toContain('color: #f0f2f8')
    expect(css).toContain('opacity 280ms')
    expect(css).toContain('body.is-ready')
  })

  test('honors all overrides', () => {
    const css = buildLoadFadeCss({ bg: '#fff', fg: '#000', font: 'serif', durationMs: 500, readyClass: 'shown', colorScheme: 'light' })
    expect(css).toContain('background: #fff')
    expect(css).toContain('color: #000')
    expect(css).toContain('font-family: serif')
    expect(css).toContain('opacity 500ms')
    expect(css).toContain('body.shown')
    expect(css).toContain('color-scheme: light')
  })

  test('partial overrides merge with defaults', () => {
    const css = buildLoadFadeCss({ bg: '#000' })
    expect(css).toContain('background: #000')
    expect(css).toContain('color: #f0f2f8')
  })
})

describe('injectLoadFadeStyles', () => {
  beforeEach(() => { document.head.innerHTML = '' })

  test('injects a style tag with the css', () => {
    injectLoadFadeStyles()
    const style = document.getElementById('page-load-fade-styles')
    expect(style).toBeTruthy()
    expect(style.textContent).toContain('opacity: 0')
  })

  test('does not duplicate when called twice', () => {
    injectLoadFadeStyles()
    injectLoadFadeStyles()
    expect(document.querySelectorAll('#page-load-fade-styles').length).toBe(1)
  })

  test('honors custom id', () => {
    injectLoadFadeStyles({}, 'my-id')
    expect(document.getElementById('my-id')).toBeTruthy()
  })

  test('passes options through to css', () => {
    injectLoadFadeStyles({ bg: '#abc', durationMs: 100 })
    const css = document.getElementById('page-load-fade-styles').textContent
    expect(css).toContain('#abc')
    expect(css).toContain('100ms')
  })
})

describe('markReady', () => {
  beforeEach(() => { document.body.className = '' })

  test('adds default ready class to body', () => {
    const ok = markReady()
    expect(document.body.classList.contains('is-ready')).toBe(true)
    expect(ok).toBe(true)
  })

  test('honors custom readyClass', () => {
    markReady({ readyClass: 'shown' })
    expect(document.body.classList.contains('shown')).toBe(true)
  })

  test('honors custom target', () => {
    const el = document.createElement('div')
    markReady({ target: el })
    expect(el.classList.contains('is-ready')).toBe(true)
  })

  test('returns false when target is missing', () => {
    expect(markReady({ target: null })).toBe(true)
  })
})

describe('whenReady', () => {
  test('rejects non-function callback', () => {
    expect(() => whenReady('not a function')).toThrow(TypeError)
  })

  test('runs immediately when readyState is complete', () => {
    Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true })
    let ran = false
    whenReady(() => { ran = true })
    expect(ran).toBe(true)
  })

  test('runs immediately on DOMContentLoaded when interactive', () => {
    Object.defineProperty(document, 'readyState', { value: 'interactive', configurable: true })
    let ran = false
    whenReady(() => { ran = true }, { event: 'DOMContentLoaded' })
    expect(ran).toBe(true)
  })

  test('listens for event when not yet ready', () => {
    Object.defineProperty(document, 'readyState', { value: 'loading', configurable: true })
    let ran = false
    whenReady(() => { ran = true })
    expect(ran).toBe(false)
    window.dispatchEvent(new Event('load'))
    expect(ran).toBe(true)
  })
})
