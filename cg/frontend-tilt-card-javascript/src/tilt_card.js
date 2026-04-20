const TEMPLATE = `
  <div class="frame" part="frame">
    <div class="inner" part="inner">
      <slot></slot>
    </div>
    <div class="glare" part="glare" aria-hidden="true"></div>
  </div>
`

const STYLES = `
  :host {
    display: block;
    perspective: var(--tilt-perspective, 900px);
  }
  .frame {
    position: relative;
    border-radius: var(--tilt-radius, 12px);
    transform-style: preserve-3d;
    transition: transform var(--tilt-rest-ms, 360ms) cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform;
  }
  .inner {
    position: relative;
    border-radius: inherit;
    overflow: hidden;
    background: var(--tilt-bg, transparent);
    transform: translateZ(0);
  }
  .glare {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background: radial-gradient(
      var(--tilt-glare-size, 60%) circle at var(--tilt-glare-x, 50%) var(--tilt-glare-y, 50%),
      var(--tilt-glare-color, rgba(255, 255, 255, 0.18)),
      transparent 60%
    );
    opacity: var(--tilt-glare-opacity, 0);
    transition: opacity var(--tilt-rest-ms, 360ms) ease;
    mix-blend-mode: var(--tilt-glare-blend, screen);
  }
`

export class TiltCard extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`
    this._frame = this.shadowRoot.querySelector('.frame')
  }

  connectedCallback() {
    this.addEventListener('pointermove', this._onMove)
    this.addEventListener('pointerleave', this._onLeave)
  }

  disconnectedCallback() {
    this.removeEventListener('pointermove', this._onMove)
    this.removeEventListener('pointerleave', this._onLeave)
  }

  get max() {
    const n = Number(this.getAttribute('max'))
    return Number.isFinite(n) && n > 0 ? n : 12
  }

  get scale() {
    const n = Number(this.getAttribute('scale'))
    return Number.isFinite(n) && n > 0 ? n : 1.02
  }

  _onMove = (e) => {
    const rect = this.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const max = this.max
    const rx = (0.5 - y) * max * 2
    const ry = (x - 0.5) * max * 2
    this._frame.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${this.scale})`
    this._frame.style.transition = 'transform 60ms linear'
    this.style.setProperty('--tilt-glare-x', `${(x * 100).toFixed(1)}%`)
    this.style.setProperty('--tilt-glare-y', `${(y * 100).toFixed(1)}%`)
    this.style.setProperty('--tilt-glare-opacity', '1')
  }

  _onLeave = () => {
    this._frame.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)'
    this._frame.style.transition = ''
    this.style.setProperty('--tilt-glare-opacity', '0')
  }
}

export function defineTiltCard(tag = 'tilt-card') {
  if (!customElements.get(tag)) customElements.define(tag, TiltCard)
}
