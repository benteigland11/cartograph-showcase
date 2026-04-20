import { SectionLayout, defineSectionLayout } from '../src/section_layout.js'

defineSectionLayout('section-layout')

describe('SectionLayout', () => {
  beforeEach(() => { document.head.innerHTML = ''; document.body.innerHTML = '' })

  test('does not attach a shadow root', () => {
    expect(document.createElement('section-layout').shadowRoot).toBe(null)
  })

  test('appending injects styles once', () => {
    document.body.append(document.createElement('section-layout'), document.createElement('section-layout'))
    expect(document.querySelectorAll('#section-layout-styles').length).toBe(1)
  })

  test('children stay in light DOM', () => {
    const sec = document.createElement('section-layout')
    sec.appendChild(document.createElement('p'))
    document.body.appendChild(sec)
    expect(sec.children.length).toBe(1)
  })

  test('injected styles set max-width and padding', () => {
    document.body.appendChild(document.createElement('section-layout'))
    const css = document.getElementById('section-layout-styles').textContent
    expect(css).toContain('--section-max')
    expect(css).toContain('--section-padding-y')
    expect(css).toContain('--section-padding-x')
    expect(css).toContain('margin-inline: auto')
  })

  test('bleed attribute is supported in the stylesheet', () => {
    document.body.appendChild(document.createElement('section-layout'))
    const css = document.getElementById('section-layout-styles').textContent
    expect(css).toContain('section-layout[bleed]')
  })

  test('defineSectionLayout is idempotent', () => {
    defineSectionLayout('section-layout')
    defineSectionLayout('section-layout')
    expect(customElements.get('section-layout')).toBe(SectionLayout)
  })
})
