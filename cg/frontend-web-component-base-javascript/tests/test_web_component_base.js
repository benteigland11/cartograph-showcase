import { WebComponentBase, defineComponent } from '../src/web_component_base.js'

class TestCard extends WebComponentBase {
  static template = `<div class="card"><slot></slot><button id="btn">click</button></div>`
  static styles = `.card { color: red; } button { padding: 4px; }`
}

defineComponent('test-card', TestCard)

describe('WebComponentBase', () => {
  test('attaches an open shadow root', () => {
    const el = document.createElement('test-card')
    expect(el.shadowRoot).toBeTruthy()
    expect(el.shadowRoot.mode).toBe('open')
  })

  test('renders template into shadow root', () => {
    const el = document.createElement('test-card')
    expect(el.shadowRoot.querySelector('.card')).toBeTruthy()
  })

  test('injects styles into shadow root', () => {
    const el = document.createElement('test-card')
    const style = el.shadowRoot.querySelector('style')
    expect(style.textContent).toContain('color: red')
  })

  test('$ queries inside shadow root', () => {
    const el = document.createElement('test-card')
    expect(el.$('button').id).toBe('btn')
  })

  test('$$ returns array of matches', () => {
    const el = document.createElement('test-card')
    const results = el.$$('div')
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBe(1)
  })

  test('emit dispatches a composed bubbling custom event', () => {
    const el = document.createElement('test-card')
    document.body.appendChild(el)
    let received = null
    document.body.addEventListener('thing-happened', (e) => { received = e.detail })
    el.emit('thing-happened', { value: 42 })
    expect(received).toEqual({ value: 42 })
    el.remove()
  })

  test('defineComponent is idempotent', () => {
    class Other extends WebComponentBase {}
    defineComponent('test-other', Other)
    defineComponent('test-other', Other)
    expect(customElements.get('test-other')).toBe(Other)
  })
})
