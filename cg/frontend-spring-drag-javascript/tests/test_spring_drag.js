import { SpringDrag, defineSpringDrag } from '../src/spring_drag.js'

globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)

defineSpringDrag('spring-drag')

function flush(ms = 30) { return new Promise((r) => setTimeout(r, ms)) }

describe('SpringDrag', () => {
  test('attaches shadow root with puck', () => {
    const el = document.createElement('spring-drag')
    expect(el.shadowRoot.querySelector('.puck')).toBeTruthy()
  })

  test('default stiffness and damping', () => {
    const el = document.createElement('spring-drag')
    expect(el.stiffness).toBeCloseTo(0.18)
    expect(el.damping).toBeCloseTo(0.72)
  })

  test('honors stiffness and damping attributes', () => {
    const el = document.createElement('spring-drag')
    el.setAttribute('stiffness', '0.3')
    el.setAttribute('damping', '0.5')
    expect(el.stiffness).toBeCloseTo(0.3)
    expect(el.damping).toBeCloseTo(0.5)
  })

  test('rejects invalid attribute values', () => {
    const el = document.createElement('spring-drag')
    el.setAttribute('stiffness', '-1')
    expect(el.stiffness).toBeCloseTo(0.18)
    el.setAttribute('damping', '1')
    expect(el.damping).toBeCloseTo(0.72)
    el.setAttribute('damping', 'abc')
    expect(el.damping).toBeCloseTo(0.72)
  })

  test('default range is Infinity', () => {
    const el = document.createElement('spring-drag')
    expect(el.range).toBe(Infinity)
  })

  test('honors range attribute', () => {
    const el = document.createElement('spring-drag')
    el.setAttribute('range', '50')
    expect(el.range).toBe(50)
  })

  test('pointerdown emits drag-start and sets dragging', () => {
    const el = document.createElement('spring-drag')
    document.body.appendChild(el)
    let started = false
    el.addEventListener('drag-start', () => { started = true })
    const puck = el.shadowRoot.querySelector('.puck')
    puck.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0, pointerId: 1, bubbles: true }))
    expect(started).toBe(true)
    expect(el.hasAttribute('dragging')).toBe(true)
    el.remove()
  })

  test('pointermove updates position while dragging', () => {
    const el = document.createElement('spring-drag')
    document.body.appendChild(el)
    const puck = el.shadowRoot.querySelector('.puck')
    puck.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0, pointerId: 1, bubbles: true }))
    el.dispatchEvent(new PointerEvent('pointermove', { clientX: 30, clientY: 40, pointerId: 1, bubbles: true }))
    expect(el._x).toBe(30)
    expect(el._y).toBe(40)
    el.remove()
  })

  test('range clamps drag distance', () => {
    const el = document.createElement('spring-drag')
    el.setAttribute('range', '10')
    document.body.appendChild(el)
    const puck = el.shadowRoot.querySelector('.puck')
    puck.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0, pointerId: 1, bubbles: true }))
    el.dispatchEvent(new PointerEvent('pointermove', { clientX: 100, clientY: 0, pointerId: 1, bubbles: true }))
    expect(el._x).toBeCloseTo(10)
    el.remove()
  })

  test('pointermove without drag is a no-op', () => {
    const el = document.createElement('spring-drag')
    document.body.appendChild(el)
    el.dispatchEvent(new PointerEvent('pointermove', { clientX: 99, clientY: 99, pointerId: 1, bubbles: true }))
    expect(el._x).toBe(0)
    el.remove()
  })

  test('pointerup ends drag and emits drag-end', () => {
    const el = document.createElement('spring-drag')
    document.body.appendChild(el)
    let ended = false
    el.addEventListener('drag-end', () => { ended = true })
    const puck = el.shadowRoot.querySelector('.puck')
    puck.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0, pointerId: 1, bubbles: true }))
    el.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }))
    expect(ended).toBe(true)
    expect(el.hasAttribute('dragging')).toBe(false)
    el.remove()
  })

  test('pointerup without active drag is safe', () => {
    const el = document.createElement('spring-drag')
    document.body.appendChild(el)
    expect(() => el.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }))).not.toThrow()
    el.remove()
  })

  test('animation loop springs back toward origin', async () => {
    const el = document.createElement('spring-drag')
    document.body.appendChild(el)
    el._x = 100; el._y = 100
    await flush(50)
    expect(Math.abs(el._x)).toBeLessThan(100)
    el.remove()
  })

  test('defineSpringDrag is idempotent', () => {
    defineSpringDrag('spring-drag')
    defineSpringDrag('spring-drag')
    expect(customElements.get('spring-drag')).toBe(SpringDrag)
  })
})
