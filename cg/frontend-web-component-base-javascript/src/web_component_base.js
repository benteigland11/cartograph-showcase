export class WebComponentBase extends HTMLElement {
  static template = ''
  static styles = ''

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    const ctor = this.constructor
    this.shadowRoot.innerHTML = `<style>${ctor.styles}</style>${ctor.template}`
  }

  $(selector) {
    return this.shadowRoot.querySelector(selector)
  }

  $$(selector) {
    return Array.from(this.shadowRoot.querySelectorAll(selector))
  }

  emit(name, detail) {
    this.dispatchEvent(new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true,
    }))
  }
}

export function defineComponent(tagName, ComponentClass) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, ComponentClass)
  }
}
