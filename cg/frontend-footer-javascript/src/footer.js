const TEMPLATE = `
  <footer part="footer">
    <div class="grid" part="grid">
      <slot name="brand"></slot>
      <slot name="columns"></slot>
    </div>
    <div class="meta" part="meta">
      <small class="legal"><slot name="legal"></slot></small>
      <small class="attribution"><slot name="attribution"></slot></small>
    </div>
  </footer>
`

const STYLES = `
  :host {
    display: block;
    background: var(--footer-bg, #06070b);
    color: var(--footer-fg, #8a90a0);
    border-top: 1px solid var(--footer-border, rgba(255, 255, 255, 0.06));
    font-family: var(--footer-font, system-ui, -apple-system, sans-serif);
    font-size: var(--footer-size, 0.9rem);
  }
  footer {
    max-width: var(--footer-max-width, 72rem);
    margin: 0 auto;
    padding: var(--footer-padding-y, 3rem) var(--footer-padding-x, 1.5rem);
  }
  .grid {
    display: grid;
    grid-template-columns: var(--footer-grid, 1fr 2fr);
    gap: var(--footer-gap, 3rem);
    align-items: start;
  }
  ::slotted([slot="brand"]) {
    color: var(--footer-brand-fg, #f0f2f8);
    font-weight: 600;
    font-size: 1.05rem;
  }
  ::slotted([slot="columns"]) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 2rem;
  }
  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    margin-top: var(--footer-meta-gap, 2.5rem);
    padding-top: 1.25rem;
    border-top: 1px solid var(--footer-border, rgba(255, 255, 255, 0.06));
    color: var(--footer-meta-fg, #5a6070);
  }
  ::slotted(a) {
    color: inherit;
    text-decoration: none;
    transition: color 120ms ease;
  }
  ::slotted(a:hover), ::slotted(a:focus-visible) {
    color: var(--footer-link-hover, #f0f2f8);
  }
  @media (max-width: 640px) {
    .grid { grid-template-columns: 1fr; gap: 2rem; }
    .meta { flex-direction: column; align-items: flex-start; }
  }
`

export class SiteFooter extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`
  }
}

export function defineSiteFooter(tag = 'site-footer') {
  if (!customElements.get(tag)) customElements.define(tag, SiteFooter)
}
