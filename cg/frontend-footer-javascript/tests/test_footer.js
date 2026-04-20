import { SiteFooter, defineSiteFooter } from '../src/footer.js'

defineSiteFooter('site-footer')

describe('SiteFooter', () => {
  test('attaches an open shadow root', () => {
    const el = document.createElement('site-footer')
    expect(el.shadowRoot).toBeTruthy()
    expect(el.shadowRoot.mode).toBe('open')
  })

  test('renders footer element', () => {
    const el = document.createElement('site-footer')
    expect(el.shadowRoot.querySelector('footer')).toBeTruthy()
  })

  test('exposes brand, columns, legal, attribution slots', () => {
    const el = document.createElement('site-footer')
    const slotNames = Array.from(el.shadowRoot.querySelectorAll('slot')).map(s => s.getAttribute('name'))
    expect(slotNames).toContain('brand')
    expect(slotNames).toContain('columns')
    expect(slotNames).toContain('legal')
    expect(slotNames).toContain('attribution')
  })

  test('includes a meta row with separator', () => {
    const el = document.createElement('site-footer')
    expect(el.shadowRoot.querySelector('.meta')).toBeTruthy()
  })

  test('includes a grid container', () => {
    const el = document.createElement('site-footer')
    expect(el.shadowRoot.querySelector('.grid')).toBeTruthy()
  })

  test('defineSiteFooter is idempotent', () => {
    defineSiteFooter('site-footer')
    defineSiteFooter('site-footer')
    expect(customElements.get('site-footer')).toBe(SiteFooter)
  })
})
