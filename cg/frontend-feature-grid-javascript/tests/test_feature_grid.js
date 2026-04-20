import { FeatureGrid, FeatureCard, defineFeatureGrid } from '../src/feature_grid.js'

defineFeatureGrid('feature-grid', 'feature-card')

describe('FeatureGrid', () => {
  beforeEach(() => { document.head.innerHTML = ''; document.body.innerHTML = '' })

  test('does not attach a shadow root (light DOM grid)', () => {
    const el = document.createElement('feature-grid')
    expect(el.shadowRoot).toBe(null)
  })

  test('appending injects grid styles once', () => {
    const a = document.createElement('feature-grid')
    document.body.appendChild(a)
    const b = document.createElement('feature-grid')
    document.body.appendChild(b)
    expect(document.querySelectorAll('#feature-grid-styles').length).toBe(1)
  })

  test('children of grid stay in light DOM', () => {
    const grid = document.createElement('feature-grid')
    const card = document.createElement('feature-card')
    grid.appendChild(card)
    document.body.appendChild(grid)
    expect(grid.children.length).toBe(1)
    expect(grid.firstElementChild).toBe(card)
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
