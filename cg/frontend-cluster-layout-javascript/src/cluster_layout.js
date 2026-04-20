const STYLE_ID = 'cluster-layout-styles'
const STYLES = `
  cluster-layout {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cluster-gap, 0.75rem);
    align-items: var(--cluster-align, center);
    justify-content: var(--cluster-justify, flex-start);
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

export class ClusterLayout extends HTMLElement {
  connectedCallback() { injectStyles() }
}

export function defineClusterLayout(tag = 'cluster-layout') {
  if (!customElements.get(tag)) customElements.define(tag, ClusterLayout)
}
