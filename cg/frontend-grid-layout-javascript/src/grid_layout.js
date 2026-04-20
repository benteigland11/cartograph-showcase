const STYLE_ID = 'grid-layout-styles'
const STYLES = `
  grid-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(var(--grid-min, 16rem), 100%), 1fr));
    gap: var(--grid-gap, 1rem);
    align-items: var(--grid-align, stretch);
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

export class GridLayout extends HTMLElement {
  connectedCallback() { injectStyles() }
}

export function defineGridLayout(tag = 'grid-layout') {
  if (!customElements.get(tag)) customElements.define(tag, GridLayout)
}
