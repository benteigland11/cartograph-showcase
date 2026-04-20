const TEMPLATE = `<span class="value" part="value"></span>`

const STYLES = `
  :host {
    display: inline-block;
    font-variant-numeric: tabular-nums;
    color: var(--sc-color, inherit);
    font-family: var(--sc-font, inherit);
    font-weight: var(--sc-weight, inherit);
  }
`

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3) }

const EASINGS = {
  linear: (t) => t,
  'ease-out': easeOutCubic,
  'ease-in-out': (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
}

function defaultFormat(n, decimals) {
  const v = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString()
  return v.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export class StatsCounter extends HTMLElement {
  static get observedAttributes() { return ['target', 'duration', 'easing', 'decimals', 'prefix', 'suffix', 'autoplay'] }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`
    this._raf = null
    this._observer = null
    this._formatter = null
  }

  set target(n) {
    if (Number.isFinite(n)) this.setAttribute('target', String(n))
  }
  get target() {
    const n = Number(this.getAttribute('target'))
    return Number.isFinite(n) ? n : 0
  }

  get duration() {
    const raw = this.getAttribute('duration')
    if (raw == null) return 1600
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : 1600
  }

  get easing() {
    const name = this.getAttribute('easing') ?? 'ease-out'
    return EASINGS[name] ?? easeOutCubic
  }

  get decimals() {
    const raw = this.getAttribute('decimals')
    if (raw == null) return 0
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0
  }

  set formatter(fn) {
    if (fn != null && typeof fn !== 'function') throw new TypeError('formatter must be a function')
    this._formatter = fn
    this._render(this.target)
  }

  connectedCallback() {
    this._render(0)
    if (this.hasAttribute('autoplay')) {
      this.play()
    } else if (typeof IntersectionObserver !== 'undefined') {
      this._observer = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            this.play()
            this._observer.disconnect()
            this._observer = null
            return
          }
        }
      }, { threshold: 0.4 })
      this._observer.observe(this)
    } else {
      this.play()
    }
  }

  disconnectedCallback() {
    if (this._raf != null) cancelAnimationFrame(this._raf)
    if (this._observer) { this._observer.disconnect(); this._observer = null }
  }

  attributeChangedCallback(name) {
    if (name === 'target') this._render(this.target)
  }

  play() {
    if (this._raf != null) cancelAnimationFrame(this._raf)
    const start = performance.now()
    const target = this.target
    const duration = this.duration
    const ease = this.easing
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const value = target * ease(t)
      this._render(value)
      if (t < 1) this._raf = requestAnimationFrame(tick)
      else { this._raf = null; this.dispatchEvent(new CustomEvent('counter-complete', { bubbles: true, composed: true })) }
    }
    this._raf = requestAnimationFrame(tick)
  }

  _render(value) {
    const text = this._formatter
      ? this._formatter(value)
      : (this.getAttribute('prefix') ?? '') + defaultFormat(value, this.decimals) + (this.getAttribute('suffix') ?? '')
    this.shadowRoot.querySelector('.value').textContent = text
  }
}

export function defineStatsCounter(tag = 'stats-counter') {
  if (!customElements.get(tag)) customElements.define(tag, StatsCounter)
}
