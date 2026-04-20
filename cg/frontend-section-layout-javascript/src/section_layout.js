const STYLE_ID = 'section-layout-styles'
const STYLES = `
  section-layout {
    display: block;
    box-sizing: border-box;
    width: 100%;
    max-width: var(--section-max, 64rem);
    margin-inline: auto;
    padding-block: var(--section-padding-y, clamp(2rem, 6vw, 4rem));
    padding-inline: var(--section-padding-x, clamp(1rem, 5vw, 1.5rem));
  }
  section-layout[bleed] {
    max-width: none;
    padding-inline: 0;
  }
`

function injectStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = STYLES
  document.head.appendChild(style)
}

export class SectionLayout extends HTMLElement {
  connectedCallback() { injectStyles() }
}

export function defineSectionLayout(tag = 'section-layout') {
  if (!customElements.get(tag)) customElements.define(tag, SectionLayout)
}
