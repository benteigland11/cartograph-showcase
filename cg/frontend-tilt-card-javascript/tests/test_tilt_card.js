import { TiltCard, defineTiltCard } from '../src/tilt_card.js'

defineTiltCard('tilt-card')

function rectOf(el, w, h) { el.getBoundingClientRect = () => ({ left: 0, top: 0, width: w, height: h, right: w, bottom: h, x: 0, y: 0 }) }

describe('TiltCard', () => {
  test('attaches shadow root', () => {
    const el = document.createElement('tilt-card')
    expect(el.shadowRoot.querySelector('.frame')).toBeTruthy()
    expect(el.shadowRoot.querySelector('.glare')).toBeTruthy()
  })

  test('exposes default slot', () => {
    const el = document.createElement('tilt-card')
    expect(el.shadowRoot.querySelector('slot')).toBeTruthy()
  })

  test('default max is 12 degrees', () => {
    const el = document.createElement('tilt-card')
    expect(el.max).toBe(12)
  })

  test('honors max attribute', () => {
    const el = document.createElement('tilt-card')
    el.setAttribute('max', '20')
    expect(el.max).toBe(20)
  })

  test('rejects invalid max', () => {
    const el = document.createElement('tilt-card')
    el.setAttribute('max', 'abc')
    expect(el.max).toBe(12)
    el.setAttribute('max', '-5')
    expect(el.max).toBe(12)
  })

  test('default scale is 1.02', () => {
    const el = document.createElement('tilt-card')
    expect(el.scale).toBe(1.02)
  })

  test('honors scale attribute', () => {
    const el = document.createElement('tilt-card')
    el.setAttribute('scale', '1.1')
    expect(el.scale).toBeCloseTo(1.1)
  })

  test('rejects invalid scale', () => {
    const el = document.createElement('tilt-card')
    el.setAttribute('scale', 'nope')
    expect(el.scale).toBe(1.02)
  })

  test('pointermove applies transform', () => {
    const el = document.createElement('tilt-card')
    document.body.appendChild(el)
    rectOf(el, 200, 100)
    el.dispatchEvent(new PointerEvent('pointermove', { clientX: 50, clientY: 25, bubbles: true }))
    const frame = el.shadowRoot.querySelector('.frame')
    expect(frame.style.transform).toContain('rotateX')
    expect(frame.style.transform).toContain('rotateY')
    el.remove()
  })

  test('pointermove updates glare position', () => {
    const el = document.createElement('tilt-card')
    document.body.appendChild(el)
    rectOf(el, 200, 100)
    el.dispatchEvent(new PointerEvent('pointermove', { clientX: 100, clientY: 50, bubbles: true }))
    expect(el.style.getPropertyValue('--tilt-glare-x')).toBe('50.0%')
    expect(el.style.getPropertyValue('--tilt-glare-y')).toBe('50.0%')
    expect(el.style.getPropertyValue('--tilt-glare-opacity')).toBe('1')
    el.remove()
  })

  test('pointerleave resets transform and glare', () => {
    const el = document.createElement('tilt-card')
    document.body.appendChild(el)
    rectOf(el, 200, 100)
    el.dispatchEvent(new PointerEvent('pointermove', { clientX: 50, clientY: 25, bubbles: true }))
    el.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }))
    const frame = el.shadowRoot.querySelector('.frame')
    expect(frame.style.transform).toContain('rotateX(0deg)')
    expect(el.style.getPropertyValue('--tilt-glare-opacity')).toBe('0')
    el.remove()
  })

  test('defineTiltCard is idempotent', () => {
    defineTiltCard('tilt-card')
    defineTiltCard('tilt-card')
    expect(customElements.get('tilt-card')).toBe(TiltCard)
  })
})
