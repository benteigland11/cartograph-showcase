const TEMPLATE = `
  <nav part="nav">
    <a class="brand" part="brand">
      <slot name="brand"></slot>
    </a>
    <button class="toggle" part="toggle" aria-label="Toggle navigation" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <div class="links" part="links">
      <slot name="links"></slot>
    </div>
  </nav>
`

const STYLES = `
  :host {
    display: block;
    position: var(--nav-position, sticky);
    top: 0;
    z-index: 50;
    background: var(--nav-bg, rgba(10, 11, 16, 0.85));
    backdrop-filter: var(--nav-backdrop, saturate(180%) blur(12px));
    -webkit-backdrop-filter: var(--nav-backdrop, saturate(180%) blur(12px));
    border-bottom: 1px solid var(--nav-border, rgba(255, 255, 255, 0.06));
    color: var(--nav-fg, #f0f2f8);
    font-family: var(--nav-font, system-ui, -apple-system, sans-serif);
  }
  nav {
    max-width: var(--nav-max-width, 72rem);
    margin: 0 auto;
    padding: var(--nav-padding-y, 0.875rem) var(--nav-padding-x, 1.5rem);
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .brand {
    text-decoration: none;
    color: inherit;
    font-weight: 600;
    font-size: var(--nav-brand-size, 1.05rem);
    letter-spacing: -0.01em;
  }
  .links {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--nav-link-gap, 1.5rem);
  }
  ::slotted(a) {
    color: var(--nav-link-fg, #b8bec8);
    text-decoration: none;
    font-size: 0.92rem;
    transition: color 120ms ease;
  }
  ::slotted(a:hover), ::slotted(a:focus-visible) {
    color: var(--nav-link-hover, #f0f2f8);
  }
  .toggle {
    display: none;
    background: transparent;
    border: 0;
    padding: 0.5rem;
    cursor: pointer;
    margin-left: auto;
  }
  .toggle span {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--nav-fg, #f0f2f8);
    margin: 4px 0;
    transition: transform 200ms ease, opacity 200ms ease;
  }
  @media (max-width: 640px) {
    .toggle { display: block; }
    .links {
      position: absolute;
      top: 100%;
      left: 0; right: 0;
      flex-direction: column;
      align-items: stretch;
      gap: 0;
      padding: 0.5rem 1.5rem 1rem;
      background: var(--nav-bg, rgba(10, 11, 16, 0.95));
      border-bottom: 1px solid var(--nav-border, rgba(255, 255, 255, 0.06));
      transform: translateY(-8px);
      opacity: 0;
      pointer-events: none;
      transition: transform 180ms ease, opacity 180ms ease;
    }
    :host([open]) .links {
      transform: translateY(0);
      opacity: 1;
      pointer-events: auto;
    }
    ::slotted(a) {
      padding: 0.75rem 0;
      border-top: 1px solid var(--nav-border, rgba(255, 255, 255, 0.06));
    }
  }
`

export class SiteNav extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`
  }

  connectedCallback() {
    const toggle = this.shadowRoot.querySelector('.toggle')
    toggle.addEventListener('click', () => this.toggleOpen())
    this.shadowRoot.querySelector('slot[name="links"]')
      .addEventListener('click', (e) => {
        if (e.target.tagName === 'A') this.removeAttribute('open')
      })
  }

  toggleOpen() {
    const isOpen = this.hasAttribute('open')
    if (isOpen) this.removeAttribute('open')
    else this.setAttribute('open', '')
    this.shadowRoot.querySelector('.toggle').setAttribute('aria-expanded', String(!isOpen))
  }
}

export function defineSiteNav(tag = 'site-nav') {
  if (!customElements.get(tag)) customElements.define(tag, SiteNav)
}
