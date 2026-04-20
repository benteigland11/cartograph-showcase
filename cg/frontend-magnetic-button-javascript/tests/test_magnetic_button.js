import { MagneticButton, defineMagneticButton } from '../src/magnetic_button.js'

defineMagneticButton('magnetic-button')

function rectOf(el, l, t, w, h) {
  el.getBoundingClientRect = () => ({ left: l, top: t, right: l + w, bottom: t + h, width: w, height: h, x: l, y: t })
}

describe('MagneticButton', () => {
  test('attaches shadow root with puck', () => {
    const el = document.createElement('magnetic-button')
    expect(el.shadowRoot.querySelector('.puck')).toBeTruthy()
  })

  test('default radius is 120', () => {
    const el = document.createElement('magnetic-button')
    expect(el.radius).toBe(120)
  })

  test('honors radius attribute', () => {
    const el = document.createElement('magnetic-button')
    el.setAttribute('radius', '200')
    expect(el.radius).toBe(200)
  })

  test('rejects invalid radius', () => {
    const el = document.createElement('magnetic-button')
    el.setAttribute('radius', 'abc')
    expect(el.radius).toBe(120)
    el.setAttribute('radius', '-1')
    expect(el.radius).toBe(120)
  })

  test('default strength is 0.35', () => {
    const el = document.createElement('magnetic-button')
    expect(el.strength).toBeCloseTo(0.35)
  })

  test('honors strength attribute', () => {
    const el = document.createElement('magnetic-button')
    el.setAttribute('strength', '0.6')
    expect(el.strength).toBeCloseTo(0.6)
  })

  test('rejects invalid strength', () => {
    const el = document.createElement('magnetic-button')
    el.setAttribute('strength', 'abc')
    expect(el.strength).toBeCloseTo(0.35)
  })

  test('cursor inside radius pulls the puck', () => {
    const el = document.createElement('magnetic-button')
    document.body.appendChild(el)
    rectOf(el, 100, 100, 60, 60)
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 140, clientY: 130, bubbles: true }))
    expect(el.shadowRoot.querySelector('.puck').style.transform).not.toBe('translate(0, 0)')
    expect(el.hasAttribute('active')).toBe(true)
    el.remove()
  })

  test('cursor outside radius releases the puck', () => {
    const el = document.createElement('magnetic-button')
    document.body.appendChild(el)
    rectOf(el, 100, 100, 60, 60)
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 140, clientY: 130, bubbles: true }))
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 1000, clientY: 1000, bubbles: true }))
    expect(el.shadowRoot.querySelector('.puck').style.transform).toBe('translate(0, 0)')
    expect(el.hasAttribute('active')).toBe(false)
    el.remove()
  })

  test('pointerleave on document releases the puck', () => {
    const el = document.createElement('magnetic-button')
    document.body.appendChild(el)
    rectOf(el, 100, 100, 60, 60)
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 140, clientY: 130, bubbles: true }))
    document.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }))
    expect(el.shadowRoot.querySelector('.puck').style.transform).toBe('translate(0, 0)')
    el.remove()
  })

  test('disconnect removes document listeners', () => {
    const el = document.createElement('magnetic-button')
    document.body.appendChild(el)
    rectOf(el, 100, 100, 60, 60)
    el.remove()
    expect(() => document.dispatchEvent(new PointerEvent('pointermove', { clientX: 140, clientY: 130, bubbles: true }))).not.toThrow()
  })

  test('defineMagneticButton is idempotent', () => {
    defineMagneticButton('magnetic-button')
    defineMagneticButton('magnetic-button')
    expect(customElements.get('magnetic-button')).toBe(MagneticButton)
  })
})
