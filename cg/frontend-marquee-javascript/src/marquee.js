const TEMPLATE = `
  <div class="track" part="track">
    <div class="row" part="row">
      <slot></slot>
    </div>
    <div class="row" aria-hidden="true" part="row-clone"></div>
  </div>
`

const STYLES = `
  :host {
    display: block;
    overflow: hidden;
    --m-gap: 2.5rem;
    --m-duration: 30s;
    --m-direction: normal;
    mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  }
  :host([direction="reverse"]) { --m-direction: reverse; }
  :host([paused]) .track { animation-play-state: paused; }
  .track {
    display: flex;
    width: max-content;
    animation: marquee var(--m-duration) linear infinite;
    animation-direction: var(--m-direction);
    will-change: transform;
  }
  :host([pause-on-hover]:hover) .track { animation-play-state: paused; }
  .row {
    display: flex;
    align-items: center;
    gap: var(--m-gap);
    padding-right: var(--m-gap);
    flex-shrink: 0;
  }
  ::slotted(*) { flex-shrink: 0; }
  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .track { animation: none; }
  }
`

export class MarqueeRow extends HTMLElement {
  static get observedAttributes() { return ['speed', 'gap'] }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`
  }

  connectedCallback() {
    this._applyAttributes()
    this._cloneOnce()
    const slot = this.shadowRoot.querySelector('slot')
    slot.addEventListener('slotchange', () => this._cloneOnce())
  }

  attributeChangedCallback() { this._applyAttributes() }

  _applyAttributes() {
    const speed = Number(this.getAttribute('speed'))
    if (Number.isFinite(speed) && speed > 0) {
      this.style.setProperty('--m-duration', `${speed}s`)
    }
    const gap = this.getAttribute('gap')
    if (gap) this.style.setProperty('--m-gap', gap)
  }

  _cloneOnce() {
    const clone = this.shadowRoot.querySelector('.row[aria-hidden="true"]')
    clone.innerHTML = ''
    for (const el of Array.from(this.children)) {
      clone.appendChild(el.cloneNode(true))
    }
  }
}

export function defineMarquee(tag = 'marquee-row') {
  if (!customElements.get(tag)) customElements.define(tag, MarqueeRow)
}
