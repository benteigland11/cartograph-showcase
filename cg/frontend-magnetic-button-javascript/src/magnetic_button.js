const TEMPLATE = `<div class="puck" part="puck"><slot></slot></div>`

const STYLES = `
  :host {
    display: inline-block;
    --mb-radius: 120px;
    --mb-strength: 0.35;
  }
  .puck {
    display: inline-block;
    transition: transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform;
  }
  :host([active]) .puck {
    transition: transform 80ms linear;
  }
`

export class MagneticButton extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`
    this._puck = this.shadowRoot.querySelector('.puck')
  }

  get radius() {
    const raw = this.getAttribute('radius')
    if (raw == null) return 120
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : 120
  }

  get strength() {
    const raw = this.getAttribute('strength')
    if (raw == null) return 0.35
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? n : 0.35
  }

  connectedCallback() {
    document.addEventListener('pointermove', this._onMove)
    document.addEventListener('pointerleave', this._onLeave)
  }

  disconnectedCallback() {
    document.removeEventListener('pointermove', this._onMove)
    document.removeEventListener('pointerleave', this._onLeave)
  }

  _onMove = (e) => {
    const rect = this.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const r = this.radius
    if (dist < r) {
      const pull = (1 - dist / r) * this.strength
      this._puck.style.transform = `translate(${(dx * pull).toFixed(2)}px, ${(dy * pull).toFixed(2)}px)`
      this.setAttribute('active', '')
    } else if (this.hasAttribute('active')) {
      this._puck.style.transform = 'translate(0, 0)'
      this.removeAttribute('active')
    }
  }

  _onLeave = () => {
    this._puck.style.transform = 'translate(0, 0)'
    this.removeAttribute('active')
  }
}

export function defineMagneticButton(tag = 'magnetic-button') {
  if (!customElements.get(tag)) customElements.define(tag, MagneticButton)
}
