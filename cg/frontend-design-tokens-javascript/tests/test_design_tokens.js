import { defaultTokens, tokensToCss, applyTokens } from '../src/design_tokens.js'

describe('defaultTokens', () => {
  test('exposes core groups', () => {
    expect(defaultTokens.color).toBeDefined()
    expect(defaultTokens.space).toBeDefined()
    expect(defaultTokens.radius).toBeDefined()
    expect(defaultTokens.shadow).toBeDefined()
    expect(defaultTokens.font).toBeDefined()
    expect(defaultTokens.size).toBeDefined()
  })
})

describe('tokensToCss', () => {
  test('emits :root block with custom properties', () => {
    const css = tokensToCss({ color: { bg: '#000', fg: '#fff' } })
    expect(css).toContain(':root')
    expect(css).toContain('--color-bg: #000;')
    expect(css).toContain('--color-fg: #fff;')
  })

  test('honors prefix option', () => {
    const css = tokensToCss({ color: { bg: '#000' } }, { prefix: 'app-' })
    expect(css).toContain('--app-color-bg: #000;')
  })
})

describe('applyTokens', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  test('injects a <style> tag with default tokens', () => {
    applyTokens()
    const style = document.getElementById('design-tokens')
    expect(style).toBeTruthy()
    expect(style.textContent).toContain('--color-bg:')
  })

  test('updates existing tag instead of creating duplicates', () => {
    applyTokens()
    applyTokens()
    expect(document.querySelectorAll('#design-tokens').length).toBe(1)
  })

  test('overrides merge over defaults', () => {
    applyTokens({ overrides: { color: { bg: '#fafafa' } } })
    const style = document.getElementById('design-tokens')
    expect(style.textContent).toContain('--color-bg: #fafafa;')
    expect(style.textContent).toContain('--color-fg:')
  })

  test('returns the merged token tree', () => {
    const tokens = applyTokens({ overrides: { color: { accent: '#ff00ff' } } })
    expect(tokens.color.accent).toBe('#ff00ff')
    expect(tokens.color.bg).toBe(defaultTokens.color.bg)
  })

  test('honors custom id', () => {
    applyTokens({ id: 'my-tokens' })
    expect(document.getElementById('my-tokens')).toBeTruthy()
  })

  test('override replaces non-object value at leaf', () => {
    const tokens = applyTokens({ overrides: { color: { bg: null } } })
    expect(tokens.color.bg).toBe(null)
  })

  test('override of an array group replaces entirely', () => {
    const css = tokensToCss({ list: { items: ['a', 'b'] } })
    expect(css).toContain('--list-items: a,b;')
  })

  test('honors prefix in applyTokens output', () => {
    applyTokens({ prefix: 'app-' })
    const style = document.getElementById('design-tokens')
    expect(style.textContent).toContain('--app-color-bg:')
  })
})
