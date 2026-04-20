const STYLE_ID = 'stack-layout-styles'
const STYLES = `
  stack-layout {
    display: flex;
    flex-direction: column;
    gap: var(--stack-gap, 1rem);
    align-items: var(--stack-align, stretch);
    justify-content: var(--stack-justify, flex-start);
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

export class StackLayout extends HTMLElement {
  connectedCallback() { injectStyles() }
}

export function defineStackLayout(tag = 'stack-layout') {
  if (!customElements.get(tag)) customElements.define(tag, StackLayout)
}
