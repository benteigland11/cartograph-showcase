import { FeatureGrid, FeatureCard, defineFeatureGrid } from '../src/feature_grid.js'

defineFeatureGrid('feature-grid', 'feature-card')

describe('FeatureGrid', () => {
  test('attaches shadow root', () => {
    const el = document.createElement('feature-grid')
    expect(el.shadowRoot).toBeTruthy()
  })

  test('renders a single default slot', () => {
    const el = document.createElement('feature-grid')
    const slots = el.shadowRoot.querySelectorAll('slot')
    expect(slots.length).toBe(1)
    expect(slots[0].getAttribute('name')).toBe(null)
  })

  test('renders a grid container', () => {
    const el = document.createElement('feature-grid')
    expect(el.shadowRoot.querySelector('div')).toBeTruthy()
  })
})

describe('FeatureCard', () => {
  test('attaches shadow root', () => {
    const el = document.createElement('feature-card')
    expect(el.shadowRoot).toBeTruthy()
  })

  test('exposes icon, title, and default slots', () => {
    const el = document.createElement('feature-card')
    const slots = Array.from(el.shadowRoot.querySelectorAll('slot'))
    const named = slots.map(s => s.getAttribute('name')).filter(Boolean)
    expect(named).toEqual(expect.arrayContaining(['icon', 'title']))
    expect(slots.some(s => !s.getAttribute('name'))).toBe(true)
  })

  test('renders article with icon, title, and body sections', () => {
    const el = document.createElement('feature-card')
    expect(el.shadowRoot.querySelector('article')).toBeTruthy()
    expect(el.shadowRoot.querySelector('.icon')).toBeTruthy()
    expect(el.shadowRoot.querySelector('h3')).toBeTruthy()
    expect(el.shadowRoot.querySelector('.body')).toBeTruthy()
  })
})

describe('defineFeatureGrid', () => {
  test('is idempotent', () => {
    defineFeatureGrid('feature-grid', 'feature-card')
    defineFeatureGrid('feature-grid', 'feature-card')
    expect(customElements.get('feature-grid')).toBe(FeatureGrid)
    expect(customElements.get('feature-card')).toBe(FeatureCard)
  })
})
