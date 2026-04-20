import { HeroSection, defineHeroSection } from '../src/hero_section.js'

defineHeroSection('hero-section')

describe('HeroSection', () => {
  test('attaches an open shadow root', () => {
    const el = document.createElement('hero-section')
    expect(el.shadowRoot).toBeTruthy()
    expect(el.shadowRoot.mode).toBe('open')
  })

  test('renders all named slots', () => {
    const el = document.createElement('hero-section')
    const names = Array.from(el.shadowRoot.querySelectorAll('slot')).map(s => s.getAttribute('name'))
    expect(names).toEqual(expect.arrayContaining(['eyebrow', 'headline', 'subhead', 'primary', 'secondary', 'visual']))
  })

  test('renders headline element', () => {
    const el = document.createElement('hero-section')
    expect(el.shadowRoot.querySelector('h1')).toBeTruthy()
  })

  test('renders eyebrow paragraph', () => {
    const el = document.createElement('hero-section')
    expect(el.shadowRoot.querySelector('.eyebrow')).toBeTruthy()
  })

  test('renders actions container', () => {
    const el = document.createElement('hero-section')
    expect(el.shadowRoot.querySelector('.actions')).toBeTruthy()
  })

  test('renders visual container', () => {
    const el = document.createElement('hero-section')
    expect(el.shadowRoot.querySelector('.visual')).toBeTruthy()
  })

  test('defineHeroSection is idempotent', () => {
    defineHeroSection('hero-section')
    defineHeroSection('hero-section')
    expect(customElements.get('hero-section')).toBe(HeroSection)
  })
})
