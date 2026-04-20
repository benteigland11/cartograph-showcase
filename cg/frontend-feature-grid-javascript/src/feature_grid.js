const GRID_TEMPLATE = `<div part="grid"><slot></slot></div>`
const GRID_STYLES = `
  :host { display: block; }
  div {
    display: grid;
    grid-template-columns: repeat(var(--fg-cols, 3), minmax(0, 1fr));
    gap: var(--fg-gap, 1.5rem);
  }
  @media (max-width: 900px) { div { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 560px) { div { grid-template-columns: minmax(0, 1fr); } }
`

const CARD_TEMPLATE = `
  <article part="card">
    <div class="icon" part="icon"><slot name="icon"></slot></div>
    <h3 part="title"><slot name="title"></slot></h3>
    <p class="body" part="body"><slot></slot></p>
  </article>
`
const CARD_STYLES = `
  :host { display: block; }
  article {
    height: 100%;
    background: var(--fc-bg, var(--color-bg-elevated, #14171f));
    border: 1px solid var(--fc-border, var(--color-border, #22252f));
    border-radius: var(--fc-radius, var(--radius-lg, 12px));
    padding: var(--fc-padding, 1.5rem);
    transition: transform 200ms ease, border-color 200ms ease, background 200ms ease;
  }
  article:hover {
    transform: translateY(-2px);
    border-color: var(--fc-border-hover, var(--color-border-strong, #363a48));
  }
  .icon {
    width: 36px; height: 36px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: var(--fc-icon-radius, 8px);
    background: var(--fc-icon-bg, rgba(125, 211, 252, 0.1));
    color: var(--fc-icon-fg, var(--color-accent, #7dd3fc));
    margin-bottom: 1rem;
  }
  h3 {
    margin: 0 0 0.5rem;
    font-size: var(--fc-title-size, 1.05rem);
    font-weight: var(--fc-title-weight, 600);
    color: var(--fc-title-fg, var(--color-fg, #f0f2f8));
    letter-spacing: -0.01em;
  }
  .body {
    margin: 0;
    color: var(--fc-body-fg, var(--color-fg-muted, #8a90a0));
    font-size: var(--fc-body-size, 0.92rem);
    line-height: 1.55;
  }
`

export class FeatureGrid extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${GRID_STYLES}</style>${GRID_TEMPLATE}`
  }
}

export class FeatureCard extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${CARD_STYLES}</style>${CARD_TEMPLATE}`
  }
}

export function defineFeatureGrid(gridTag = 'feature-grid', cardTag = 'feature-card') {
  if (!customElements.get(gridTag)) customElements.define(gridTag, FeatureGrid)
  if (!customElements.get(cardTag)) customElements.define(cardTag, FeatureCard)
}
