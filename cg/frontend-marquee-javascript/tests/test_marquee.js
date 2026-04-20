import { MarqueeRow, defineMarquee } from '../src/marquee.js'

defineMarquee('marquee-row')

describe('MarqueeRow', () => {
  test('attaches shadow root with track and two rows', () => {
    const el = document.createElement('marquee-row')
    expect(el.shadowRoot.querySelector('.track')).toBeTruthy()
    expect(el.shadowRoot.querySelectorAll('.row').length).toBe(2)
  })

  test('exposes a default slot', () => {
    const el = document.createElement('marquee-row')
    expect(el.shadowRoot.querySelector('slot')).toBeTruthy()
  })

  test('honors speed attribute as duration', () => {
    const el = document.createElement('marquee-row')
    el.setAttribute('speed', '15')
    document.body.appendChild(el)
    expect(el.style.getPropertyValue('--m-duration')).toBe('15s')
    el.remove()
  })

  test('ignores invalid speed', () => {
    const el = document.createElement('marquee-row')
    el.setAttribute('speed', 'abc')
    document.body.appendChild(el)
    expect(el.style.getPropertyValue('--m-duration')).toBe('')
    el.remove()
  })

  test('honors gap attribute', () => {
    const el = document.createElement('marquee-row')
    el.setAttribute('gap', '4rem')
    document.body.appendChild(el)
    expect(el.style.getPropertyValue('--m-gap')).toBe('4rem')
    el.remove()
  })

  test('clones slotted children into the hidden row', () => {
    const el = document.createElement('marquee-row')
    const a = document.createElement('span')
    a.textContent = 'a'
    const b = document.createElement('span')
    b.textContent = 'b'
    el.append(a, b)
    document.body.appendChild(el)
    const clone = el.shadowRoot.querySelector('.row[aria-hidden="true"]')
    expect(clone.children.length).toBe(2)
    expect(clone.children[0].textContent).toBe('a')
    expect(clone.children[1].textContent).toBe('b')
    el.remove()
  })

  test('attribute change re-applies duration', () => {
    const el = document.createElement('marquee-row')
    document.body.appendChild(el)
    el.setAttribute('speed', '20')
    expect(el.style.getPropertyValue('--m-duration')).toBe('20s')
    el.setAttribute('speed', '10')
    expect(el.style.getPropertyValue('--m-duration')).toBe('10s')
    el.remove()
  })

  test('defineMarquee is idempotent', () => {
    defineMarquee('marquee-row')
    defineMarquee('marquee-row')
    expect(customElements.get('marquee-row')).toBe(MarqueeRow)
  })
})
