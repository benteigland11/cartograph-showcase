const TEMPLATE = `<div class="puck" part="puck"><slot></slot></div>`

const STYLES = `
  :host {
    display: inline-block;
    touch-action: none;
  }
  .puck {
    display: inline-block;
    cursor: grab;
    will-change: transform;
    user-select: none;
    -webkit-user-select: none;
  }
  :host([dragging]) .puck { cursor: grabbing; }
`

export class SpringDrag extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`
    this._puck = this.shadowRoot.querySelector('.puck')
    this._x = 0; this._y = 0
    this._vx = 0; this._vy = 0
    this._tx = 0; this._ty = 0
    this._raf = null
    this._dragging = false
    this._origin = { x: 0, y: 0 }
  }

  get stiffness() {
    const raw = this.getAttribute('stiffness')
    if (raw == null) return 0.18
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : 0.18
  }
  get damping() {
    const raw = this.getAttribute('damping')
    if (raw == null) return 0.72
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 && n < 1 ? n : 0.72
  }
  get range() {
    const raw = this.getAttribute('range')
    if (raw == null) return Infinity
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : Infinity
  }

  connectedCallback() {
    this._puck.addEventListener('pointerdown', this._down)
    this.addEventListener('pointermove', this._move)
    this.addEventListener('pointerup', this._up)
    this.addEventListener('pointercancel', this._up)
    this._loop()
  }

  disconnectedCallback() {
    this._puck.removeEventListener('pointerdown', this._down)
    this.removeEventListener('pointermove', this._move)
    this.removeEventListener('pointerup', this._up)
    this.removeEventListener('pointercancel', this._up)
    if (this._raf != null) cancelAnimationFrame(this._raf)
  }

  _down = (e) => {
    e.preventDefault()
    this._dragging = true
    this.setAttribute('dragging', '')
    this._origin = { x: e.clientX - this._x, y: e.clientY - this._y }
    this._puck.setPointerCapture?.(e.pointerId)
    this.dispatchEvent(new CustomEvent('drag-start', { bubbles: true, composed: true }))
  }

  _move = (e) => {
    if (!this._dragging) return
    const nx = e.clientX - this._origin.x
    const ny = e.clientY - this._origin.y
    const r = this.range
    const dist = Math.sqrt(nx * nx + ny * ny)
    if (dist > r) {
      this._x = (nx / dist) * r
      this._y = (ny / dist) * r
    } else {
      this._x = nx
      this._y = ny
    }
  }

  _up = () => {
    if (!this._dragging) return
    this._dragging = false
    this.removeAttribute('dragging')
    this.dispatchEvent(new CustomEvent('drag-end', { bubbles: true, composed: true }))
  }

  _loop = () => {
    if (!this._dragging) {
      const fx = (this._tx - this._x) * this.stiffness
      const fy = (this._ty - this._y) * this.stiffness
      this._vx = (this._vx + fx) * this.damping
      this._vy = (this._vy + fy) * this.damping
      this._x += this._vx
      this._y += this._vy
    }
    this._puck.style.transform = `translate(${this._x.toFixed(2)}px, ${this._y.toFixed(2)}px)`
    this._raf = requestAnimationFrame(this._loop)
  }
}

export function defineSpringDrag(tag = 'spring-drag') {
  if (!customElements.get(tag)) customElements.define(tag, SpringDrag)
}
