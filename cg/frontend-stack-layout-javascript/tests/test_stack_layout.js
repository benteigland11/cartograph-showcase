import { StackLayout, defineStackLayout } from '../src/stack_layout.js'

defineStackLayout('stack-layout')

describe('StackLayout', () => {
  beforeEach(() => { document.head.innerHTML = ''; document.body.innerHTML = '' })

  test('does not attach a shadow root (light DOM)', () => {
    const el = document.createElement('stack-layout')
    expect(el.shadowRoot).toBe(null)
  })

  test('appending injects styles once', () => {
    const a = document.createElement('stack-layout')
    document.body.appendChild(a)
    const b = document.createElement('stack-layout')
    document.body.appendChild(b)
    expect(document.querySelectorAll('#stack-layout-styles').length).toBe(1)
  })

  test('children stay in light DOM', () => {
    const stack = document.createElement('stack-layout')
    const child = document.createElement('div')
    stack.appendChild(child)
    document.body.appendChild(stack)
    expect(stack.children.length).toBe(1)
    expect(stack.firstElementChild).toBe(child)
  })

  test('injected styles target the tag selector', () => {
    document.body.appendChild(document.createElement('stack-layout'))
    const css = document.getElementById('stack-layout-styles').textContent
    expect(css).toContain('stack-layout')
    expect(css).toContain('flex-direction: column')
    expect(css).toContain('--stack-gap')
  })

  test('defineStackLayout is idempotent', () => {
    defineStackLayout('stack-layout')
    defineStackLayout('stack-layout')
    expect(customElements.get('stack-layout')).toBe(StackLayout)
  })
})
