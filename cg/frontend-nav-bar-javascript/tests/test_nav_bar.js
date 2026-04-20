import { SiteNav, defineSiteNav } from '../src/nav_bar.js'

defineSiteNav('site-nav')

describe('SiteNav', () => {
  test('attaches an open shadow root', () => {
    const el = document.createElement('site-nav')
    expect(el.shadowRoot).toBeTruthy()
    expect(el.shadowRoot.mode).toBe('open')
  })

  test('renders nav, brand, links, and toggle', () => {
    const el = document.createElement('site-nav')
    expect(el.shadowRoot.querySelector('nav')).toBeTruthy()
    expect(el.shadowRoot.querySelector('.brand')).toBeTruthy()
    expect(el.shadowRoot.querySelector('.links')).toBeTruthy()
    expect(el.shadowRoot.querySelector('.toggle')).toBeTruthy()
  })

  test('exposes brand and links slots', () => {
    const el = document.createElement('site-nav')
    const slots = el.shadowRoot.querySelectorAll('slot')
    const names = Array.from(slots).map(s => s.getAttribute('name'))
    expect(names).toContain('brand')
    expect(names).toContain('links')
  })

  test('toggle button starts with aria-expanded=false', () => {
    const el = document.createElement('site-nav')
    expect(el.shadowRoot.querySelector('.toggle').getAttribute('aria-expanded')).toBe('false')
  })

  test('clicking toggle opens and closes', () => {
    const el = document.createElement('site-nav')
    document.body.appendChild(el)
    const toggle = el.shadowRoot.querySelector('.toggle')
    toggle.click()
    expect(el.hasAttribute('open')).toBe(true)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    toggle.click()
    expect(el.hasAttribute('open')).toBe(false)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    el.remove()
  })

  test('toggleOpen method is callable directly', () => {
    const el = document.createElement('site-nav')
    document.body.appendChild(el)
    el.toggleOpen()
    expect(el.hasAttribute('open')).toBe(true)
    el.remove()
  })

  test('clicking a slotted link auto-closes the nav', () => {
    const el = document.createElement('site-nav')
    document.body.appendChild(el)
    el.setAttribute('open', '')
    const linksSlot = el.shadowRoot.querySelector('slot[name="links"]')
    const fakeAnchor = document.createElement('a')
    linksSlot.dispatchEvent(new Event('click', { bubbles: true }))
    Object.defineProperty(linksSlot, 'target', { value: fakeAnchor, configurable: true })
    const event = new Event('click', { bubbles: true })
    Object.defineProperty(event, 'target', { value: fakeAnchor })
    linksSlot.dispatchEvent(event)
    expect(el.hasAttribute('open')).toBe(false)
    el.remove()
  })

  test('non-anchor clicks in links slot do not close the nav', () => {
    const el = document.createElement('site-nav')
    document.body.appendChild(el)
    el.setAttribute('open', '')
    const linksSlot = el.shadowRoot.querySelector('slot[name="links"]')
    const fakeDiv = document.createElement('div')
    const event = new Event('click', { bubbles: true })
    Object.defineProperty(event, 'target', { value: fakeDiv })
    linksSlot.dispatchEvent(event)
    expect(el.hasAttribute('open')).toBe(true)
    el.remove()
  })

  test('defineSiteNav is idempotent', () => {
    defineSiteNav('site-nav')
    defineSiteNav('site-nav')
    expect(customElements.get('site-nav')).toBe(SiteNav)
  })
})
