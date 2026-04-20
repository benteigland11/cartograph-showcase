import { GridLayout, defineGridLayout } from '../src/grid_layout.js'

defineGridLayout('grid-layout')

describe('GridLayout', () => {
  beforeEach(() => { document.head.innerHTML = ''; document.body.innerHTML = '' })

  test('does not attach a shadow root', () => {
    expect(document.createElement('grid-layout').shadowRoot).toBe(null)
  })

  test('appending injects styles once', () => {
    document.body.append(document.createElement('grid-layout'), document.createElement('grid-layout'))
    expect(document.querySelectorAll('#grid-layout-styles').length).toBe(1)
  })

  test('children stay in light DOM as grid items', () => {
    const grid = document.createElement('grid-layout')
    for (let i = 0; i < 5; i++) grid.appendChild(document.createElement('div'))
    document.body.appendChild(grid)
    expect(grid.children.length).toBe(5)
  })

  test('injected styles use auto-fit and minmax', () => {
    document.body.appendChild(document.createElement('grid-layout'))
    const css = document.getElementById('grid-layout-styles').textContent
    expect(css).toContain('auto-fit')
    expect(css).toContain('minmax')
    expect(css).toContain('--grid-min')
    expect(css).toContain('--grid-gap')
  })

  test('defineGridLayout is idempotent', () => {
    defineGridLayout('grid-layout')
    defineGridLayout('grid-layout')
    expect(customElements.get('grid-layout')).toBe(GridLayout)
  })
})
