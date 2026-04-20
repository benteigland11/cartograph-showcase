import { attachSpotlight, attachSpotlightAll, injectSpotlightStyles, SPOTLIGHT_CSS } from '../src/cursor_spotlight.js'

function rectOf(el, rect) {
  el.getBoundingClientRect = () => ({ left: 0, top: 0, right: rect.w, bottom: rect.h, width: rect.w, height: rect.h, x: 0, y: 0 })
}

describe('attachSpotlight', () => {
  beforeEach(() => { document.body.innerHTML = ''; document.head.innerHTML = '' })

  test('rejects invalid target', () => {
    expect(() => attachSpotlight(null)).toThrow(TypeError)
    expect(() => attachSpotlight({})).toThrow(TypeError)
  })

  test('updates css vars on pointer move', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    rectOf(el, { w: 200, h: 100 })
    attachSpotlight(el)
    el.dispatchEvent(new PointerEvent('pointermove', { clientX: 50, clientY: 25, bubbles: true }))
    expect(el.style.getPropertyValue('--spotlight-x')).toBe('50px')
    expect(el.style.getPropertyValue('--spotlight-y')).toBe('25px')
    expect(el.style.getPropertyValue('--spotlight-show')).toBe('1')
  })

  test('hides spotlight on pointer leave', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    rectOf(el, { w: 200, h: 100 })
    attachSpotlight(el)
    el.dispatchEvent(new PointerEvent('pointermove', { clientX: 10, clientY: 10, bubbles: true }))
    el.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }))
    expect(el.style.getPropertyValue('--spotlight-show')).toBe('0')
  })

  test('detach removes listeners', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    rectOf(el, { w: 200, h: 100 })
    const handle = attachSpotlight(el)
    handle.detach()
    el.dispatchEvent(new PointerEvent('pointermove', { clientX: 99, clientY: 99, bubbles: true }))
    expect(el.style.getPropertyValue('--spotlight-x')).toBe('')
  })

  test('honors custom var names and unit', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    rectOf(el, { w: 200, h: 100 })
    attachSpotlight(el, { xVar: '--mx', yVar: '--my', showVar: '--mshow', unit: '%' })
    el.dispatchEvent(new PointerEvent('pointermove', { clientX: 50, clientY: 25, bubbles: true }))
    expect(el.style.getPropertyValue('--mx')).toBe('50%')
    expect(el.style.getPropertyValue('--my')).toBe('25%')
    expect(el.style.getPropertyValue('--mshow')).toBe('1')
  })
})

describe('attachSpotlightAll', () => {
  beforeEach(() => { document.body.innerHTML = '' })

  test('attaches to all matching elements', () => {
    const a = document.createElement('div'); a.setAttribute('data-spotlight', '')
    const b = document.createElement('div'); b.setAttribute('data-spotlight', '')
    document.body.append(a, b)
    rectOf(a, { w: 100, h: 100 }); rectOf(b, { w: 100, h: 100 })
    const handle = attachSpotlightAll()
    a.dispatchEvent(new PointerEvent('pointermove', { clientX: 5, clientY: 5, bubbles: true }))
    b.dispatchEvent(new PointerEvent('pointermove', { clientX: 7, clientY: 7, bubbles: true }))
    expect(a.style.getPropertyValue('--spotlight-x')).toBe('5px')
    expect(b.style.getPropertyValue('--spotlight-x')).toBe('7px')
    handle.detach()
  })
})

describe('injectSpotlightStyles', () => {
  beforeEach(() => { document.head.innerHTML = '' })

  test('injects style tag once', () => {
    injectSpotlightStyles()
    injectSpotlightStyles()
    expect(document.querySelectorAll('#cursor-spotlight-styles').length).toBe(1)
  })

  test('honors custom id', () => {
    injectSpotlightStyles('my-id')
    expect(document.getElementById('my-id')).toBeTruthy()
  })
})

describe('SPOTLIGHT_CSS', () => {
  test('exports css string', () => {
    expect(SPOTLIGHT_CSS).toContain('[data-spotlight]')
    expect(SPOTLIGHT_CSS).toContain('radial-gradient')
  })
})
