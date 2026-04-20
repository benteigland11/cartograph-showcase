import { ActivityHeatmap, defineActivityHeatmap } from '../src/activity_heatmap.js'

defineActivityHeatmap('activity-heatmap')

describe('ActivityHeatmap', () => {
  test('attaches shadow root with grid and legend', () => {
    const el = document.createElement('activity-heatmap')
    expect(el.shadowRoot.querySelector('.grid')).toBeTruthy()
    expect(el.shadowRoot.querySelector('.legend')).toBeTruthy()
  })

  test('default weeks is 52', () => {
    const el = document.createElement('activity-heatmap')
    expect(el.weeks).toBe(52)
  })

  test('weeks setter accepts positive numbers', () => {
    const el = document.createElement('activity-heatmap')
    el.weeks = 26
    expect(el.weeks).toBe(26)
  })

  test('weeks setter rejects invalid', () => {
    const el = document.createElement('activity-heatmap')
    el.weeks = -1
    expect(el.weeks).toBe(52)
  })

  test('data setter rejects non-array', () => {
    const el = document.createElement('activity-heatmap')
    expect(() => { el.data = 'no' }).toThrow(TypeError)
  })

  test('palette setter rejects too short', () => {
    const el = document.createElement('activity-heatmap')
    expect(() => { el.palette = ['#fff'] }).toThrow(TypeError)
  })

  test('palette setter accepts valid array', () => {
    const el = document.createElement('activity-heatmap')
    const p = ['#000', '#fff']
    el.palette = p
    expect(el.palette).toBe(p)
  })

  test('renders 52 weeks * 7 days = 364 cells by default', () => {
    const el = document.createElement('activity-heatmap')
    document.body.appendChild(el)
    const cells = el.shadowRoot.querySelectorAll('.grid .cell')
    expect(cells.length).toBe(52 * 7)
    el.remove()
  })

  test('honors weeks attribute when rendering', () => {
    const el = document.createElement('activity-heatmap')
    el.weeks = 4
    document.body.appendChild(el)
    expect(el.shadowRoot.querySelectorAll('.grid .cell').length).toBe(4 * 7)
    el.remove()
  })

  test('renders palette swatches in legend', () => {
    const el = document.createElement('activity-heatmap')
    document.body.appendChild(el)
    const swatches = el.shadowRoot.querySelectorAll('#legend-swatches .cell')
    expect(swatches.length).toBe(5)
    el.remove()
  })

  test('cell colors increase with intensity', () => {
    const el = document.createElement('activity-heatmap')
    el.weeks = 2
    const today = new Date()
    el.data = [
      { date: today.toISOString().slice(0, 10), count: 10 },
    ]
    el.endDate = today
    document.body.appendChild(el)
    const cells = el.shadowRoot.querySelectorAll('.grid .cell')
    const filled = Array.from(cells).filter((c) => c.dataset.value !== '0')
    expect(filled.length).toBeGreaterThan(0)
    el.remove()
  })

  test('cells carry date and value data attributes', () => {
    const el = document.createElement('activity-heatmap')
    document.body.appendChild(el)
    const cell = el.shadowRoot.querySelector('.grid .cell')
    expect(cell.dataset.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(cell.dataset.value).toBeDefined()
    el.remove()
  })

  test('endDate setter accepts date strings', () => {
    const el = document.createElement('activity-heatmap')
    el.endDate = '2024-06-15'
    expect(el.endDate.getFullYear()).toBe(2024)
  })

  test('endDate getter returns now by default', () => {
    const el = document.createElement('activity-heatmap')
    expect(el.endDate.getFullYear()).toBeGreaterThanOrEqual(2020)
  })

  test('pointermove on cell shows tooltip', () => {
    const el = document.createElement('activity-heatmap')
    document.body.appendChild(el)
    const cell = el.shadowRoot.querySelector('.grid .cell')
    const tooltip = el.shadowRoot.querySelector('.tooltip')
    const grid = el.shadowRoot.querySelector('.grid')
    cell.getBoundingClientRect = () => ({ left: 10, top: 20, width: 11, height: 11, right: 21, bottom: 31, x: 10, y: 20 })
    el.shadowRoot.querySelector('.root').getBoundingClientRect = () => ({ left: 0, top: 0, width: 600, height: 100, right: 600, bottom: 100, x: 0, y: 0 })
    const event = new PointerEvent('pointermove', { bubbles: true })
    Object.defineProperty(event, 'target', { value: cell })
    grid.dispatchEvent(event)
    expect(tooltip.hidden).toBe(false)
    expect(tooltip.textContent).toContain('on')
    el.remove()
  })

  test('pointerleave hides tooltip', () => {
    const el = document.createElement('activity-heatmap')
    document.body.appendChild(el)
    const grid = el.shadowRoot.querySelector('.grid')
    const tooltip = el.shadowRoot.querySelector('.tooltip')
    tooltip.hidden = false
    grid.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }))
    expect(tooltip.hidden).toBe(true)
    el.remove()
  })

  test('cell-hover event fires with detail', () => {
    const el = document.createElement('activity-heatmap')
    document.body.appendChild(el)
    let detail = null
    el.addEventListener('cell-hover', (e) => { detail = e.detail })
    const cell = el.shadowRoot.querySelector('.grid .cell')
    cell.getBoundingClientRect = () => ({ left: 10, top: 20, width: 11, height: 11, right: 21, bottom: 31, x: 10, y: 20 })
    el.shadowRoot.querySelector('.root').getBoundingClientRect = () => ({ left: 0, top: 0, width: 600, height: 100, right: 600, bottom: 100, x: 0, y: 0 })
    const event = new PointerEvent('pointermove', { bubbles: true })
    Object.defineProperty(event, 'target', { value: cell })
    el.shadowRoot.querySelector('.grid').dispatchEvent(event)
    expect(detail.date).toBe(cell.dataset.date)
    el.remove()
  })

  test('pointermove off-cell hides tooltip', () => {
    const el = document.createElement('activity-heatmap')
    document.body.appendChild(el)
    const tooltip = el.shadowRoot.querySelector('.tooltip')
    tooltip.hidden = false
    const grid = el.shadowRoot.querySelector('.grid')
    const event = new PointerEvent('pointermove', { bubbles: true })
    Object.defineProperty(event, 'target', { value: grid })
    grid.dispatchEvent(event)
    expect(tooltip.hidden).toBe(true)
    el.remove()
  })

  test('defineActivityHeatmap is idempotent', () => {
    defineActivityHeatmap('activity-heatmap')
    defineActivityHeatmap('activity-heatmap')
    expect(customElements.get('activity-heatmap')).toBe(ActivityHeatmap)
  })
})
