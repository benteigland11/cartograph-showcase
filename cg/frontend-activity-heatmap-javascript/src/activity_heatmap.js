const TEMPLATE = `
  <div class="root" part="root">
    <div class="grid" part="grid"></div>
    <div class="legend" part="legend">
      <span class="legend-label">Less</span>
      <div class="legend-swatches" id="legend-swatches"></div>
      <span class="legend-label">More</span>
    </div>
    <div class="tooltip" part="tooltip" hidden></div>
  </div>
`

const STYLES = `
  :host {
    display: block;
    --hm-cell: 11px;
    --hm-gap: 2px;
    --hm-radius: 2px;
    --hm-empty: var(--color-bg-elevated, #14171f);
    --hm-fg: var(--color-fg-muted, #8a90a0);
    --hm-tooltip-bg: var(--color-bg-sunken, #06070b);
    --hm-tooltip-fg: var(--color-fg, #f0f2f8);
    --hm-tooltip-border: var(--color-border, #22252f);
    font-family: var(--hm-font, var(--font-sans, system-ui, sans-serif));
  }
  .root { position: relative; }
  .grid {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(7, var(--hm-cell));
    gap: var(--hm-gap);
    padding-bottom: 0.5rem;
  }
  .cell {
    width: var(--hm-cell);
    height: var(--hm-cell);
    border-radius: var(--hm-radius);
    background: var(--hm-empty);
    transition: outline-color 120ms ease;
    outline: 1px solid transparent;
    outline-offset: -1px;
  }
  .cell:hover {
    outline-color: rgba(255, 255, 255, 0.2);
  }
  .legend {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    color: var(--hm-fg);
    font-size: 0.72rem;
  }
  .legend-swatches {
    display: flex;
    gap: var(--hm-gap);
  }
  .tooltip {
    position: absolute;
    background: var(--hm-tooltip-bg);
    color: var(--hm-tooltip-fg);
    border: 1px solid var(--hm-tooltip-border);
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
    font-family: var(--hm-mono, var(--font-mono, ui-monospace, monospace));
    font-size: 0.72rem;
    pointer-events: none;
    transform: translate(-50%, -100%);
    margin-top: -8px;
    white-space: nowrap;
    z-index: 2;
  }
  .tooltip[hidden] { display: none; }
`

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
function startOfWeek(d) {
  const x = startOfDay(d)
  x.setDate(x.getDate() - x.getDay())
  return x
}
function isoDate(d) { return d.toISOString().slice(0, 10) }

function defaultColor(intensity, palette) {
  if (intensity <= 0) return palette[0]
  const idx = Math.min(palette.length - 1, Math.max(1, Math.ceil(intensity * (palette.length - 1))))
  return palette[idx]
}

const DEFAULT_PALETTE = [
  '#14171f',
  'rgba(255, 234, 0, 0.25)',
  'rgba(255, 195, 0, 0.5)',
  'rgba(255, 149, 0, 0.78)',
  '#FF9500',
]

export class ActivityHeatmap extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`
    this._data = []
    this._palette = DEFAULT_PALETTE
    this._weeks = 52
    this._max = null
    this._endDate = null
  }

  set data(arr) {
    if (!Array.isArray(arr)) throw new TypeError('data must be an array')
    this._data = arr
    if (this.isConnected) this._render()
  }
  get data() { return this._data }

  set palette(arr) {
    if (!Array.isArray(arr) || arr.length < 2) throw new TypeError('palette must be an array of at least 2 colors')
    this._palette = arr
    if (this.isConnected) this._render()
  }
  get palette() { return this._palette }

  set weeks(n) {
    if (Number.isFinite(n) && n > 0) this._weeks = Math.floor(n)
    if (this.isConnected) this._render()
  }
  get weeks() { return this._weeks }

  set endDate(d) {
    this._endDate = d ? new Date(d) : null
    if (this.isConnected) this._render()
  }
  get endDate() { return this._endDate ?? new Date() }

  connectedCallback() {
    this._render()
    const grid = this.shadowRoot.querySelector('.grid')
    grid.addEventListener('pointermove', this._onMove)
    grid.addEventListener('pointerleave', this._onLeave)
  }

  disconnectedCallback() {
    const grid = this.shadowRoot.querySelector('.grid')
    grid.removeEventListener('pointermove', this._onMove)
    grid.removeEventListener('pointerleave', this._onLeave)
  }

  _render() {
    const counts = new Map()
    let max = 0
    for (const d of this._data) {
      counts.set(d.date, (counts.get(d.date) ?? 0) + (d.count ?? 0))
      if ((d.count ?? 0) > max) max = d.count
    }
    this._max = this._max ?? max

    const end = startOfWeek(this._endDate ?? new Date())
    end.setDate(end.getDate() + 6)
    const grid = this.shadowRoot.querySelector('.grid')
    grid.innerHTML = ''
    for (let w = this._weeks - 1; w >= 0; w--) {
      const weekStart = new Date(end)
      weekStart.setDate(end.getDate() - (w * 7) - 6)
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart)
        day.setDate(weekStart.getDate() + d)
        const key = isoDate(day)
        const value = counts.get(key) ?? 0
        const intensity = max > 0 ? value / max : 0
        const cell = document.createElement('div')
        cell.className = 'cell'
        cell.style.background = defaultColor(intensity, this._palette)
        cell.dataset.date = key
        cell.dataset.value = String(value)
        grid.appendChild(cell)
      }
    }

    const swatches = this.shadowRoot.querySelector('#legend-swatches')
    swatches.innerHTML = this._palette.map((c) => `<span class="cell" style="background: ${c}"></span>`).join('')
  }

  _onMove = (e) => {
    const cell = e.target.closest('.cell')
    const tooltip = this.shadowRoot.querySelector('.tooltip')
    if (!cell || !cell.dataset.date) {
      tooltip.hidden = true
      return
    }
    const root = this.shadowRoot.querySelector('.root').getBoundingClientRect()
    const r = cell.getBoundingClientRect()
    tooltip.textContent = `${cell.dataset.value} on ${cell.dataset.date}`
    tooltip.hidden = false
    tooltip.style.left = `${r.left - root.left + r.width / 2}px`
    tooltip.style.top = `${r.top - root.top}px`
    this.dispatchEvent(new CustomEvent('cell-hover', { detail: { date: cell.dataset.date, value: Number(cell.dataset.value) }, bubbles: true, composed: true }))
  }

  _onLeave = () => {
    this.shadowRoot.querySelector('.tooltip').hidden = true
  }
}

export function defineActivityHeatmap(tag = 'activity-heatmap') {
  if (!customElements.get(tag)) customElements.define(tag, ActivityHeatmap)
}
