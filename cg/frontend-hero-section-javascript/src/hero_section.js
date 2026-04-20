const TEMPLATE = `
  <section part="section">
    <div class="inner">
      <div class="content">
        <p class="eyebrow" part="eyebrow"><slot name="eyebrow"></slot></p>
        <h1 part="headline"><slot name="headline"></slot></h1>
        <p class="subhead" part="subhead"><slot name="subhead"></slot></p>
        <div class="actions" part="actions">
          <slot name="primary"></slot>
          <slot name="secondary"></slot>
        </div>
      </div>
      <div class="visual" part="visual"><slot name="visual"></slot></div>
    </div>
  </section>
`

const STYLES = `
  :host { display: block; position: relative; overflow: hidden; }
  section {
    padding: var(--hero-padding-y, clamp(4rem, 10vw, 8rem)) var(--hero-padding-x, 1.5rem);
    background: var(--hero-bg, transparent);
    color: var(--hero-fg, inherit);
  }
  .inner {
    max-width: var(--hero-max-width, 72rem);
    margin: 0 auto;
    display: grid;
    grid-template-columns: var(--hero-grid, minmax(0, 1fr));
    gap: var(--hero-gap, 4rem);
    align-items: center;
  }
  :host([layout="split"]) .inner { grid-template-columns: var(--hero-split, minmax(0, 1.1fr) minmax(0, 1fr)); }
  :host(:not([layout="split"])) .content { text-align: center; max-width: 44rem; margin: 0 auto; }
  .eyebrow {
    display: inline-block;
    margin: 0 0 var(--hero-eyebrow-gap, 1.25rem);
    padding: 0.3rem 0.75rem;
    font-size: var(--hero-eyebrow-size, 0.78rem);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 500;
    color: var(--hero-eyebrow-fg, var(--color-accent, #7dd3fc));
    background: var(--hero-eyebrow-bg, rgba(125, 211, 252, 0.08));
    border: 1px solid var(--hero-eyebrow-border, rgba(125, 211, 252, 0.2));
    border-radius: 999px;
  }
  ::slotted([slot="headline"]) {
    display: inline;
    font-weight: var(--hero-headline-weight, 700);
    letter-spacing: -0.025em;
  }
  h1 {
    margin: 0 0 var(--hero-subhead-gap, 1.25rem);
    font-size: var(--hero-headline-size, clamp(2.25rem, 6vw, 4.25rem));
    font-weight: var(--hero-headline-weight, 700);
    line-height: var(--hero-headline-leading, 1.05);
    letter-spacing: -0.025em;
    background: var(--hero-headline-bg, linear-gradient(180deg, var(--color-fg, #f0f2f8), var(--color-fg-muted, #8a90a0)));
    -webkit-background-clip: text;
    background-clip: text;
    color: var(--hero-headline-color, transparent);
  }
  .subhead {
    margin: 0 0 var(--hero-actions-gap, 2rem);
    font-size: var(--hero-subhead-size, clamp(1rem, 1.6vw, 1.25rem));
    line-height: var(--hero-subhead-leading, 1.55);
    color: var(--hero-subhead-fg, var(--color-fg-muted, #8a90a0));
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--hero-action-gap, 0.75rem);
  }
  :host(:not([layout="split"])) .actions { justify-content: center; }
  .visual { display: contents; }
  :host([layout="split"]) .visual { display: block; }
  @media (max-width: 720px) {
    :host([layout="split"]) .inner { grid-template-columns: minmax(0, 1fr); }
    :host([layout="split"]) .content { text-align: center; }
    :host([layout="split"]) .actions { justify-content: center; }
  }
`

export class HeroSection extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`
  }
}

export function defineHeroSection(tag = 'hero-section') {
  if (!customElements.get(tag)) customElements.define(tag, HeroSection)
}
