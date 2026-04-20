import { CodeBlock, defineCodeBlock, highlightShell } from '../src/code_block.js'

defineCodeBlock('code-block')

describe('highlightShell', () => {
  test('marks the prompt', () => {
    const html = highlightShell('$ ls')
    expect(html).toContain('class="prompt"')
    expect(html).toContain('$')
  })

  test('marks the command after the prompt', () => {
    const html = highlightShell('$ ls')
    expect(html).toContain('class="command"')
  })

  test('marks flags', () => {
    const html = highlightShell('$ ls --color')
    expect(html).toContain('class="flag"')
  })

  test('marks quoted strings', () => {
    const html = highlightShell('$ echo "hi"')
    expect(html).toContain('class="string"')
  })

  test('marks comments', () => {
    const html = highlightShell('# a comment')
    expect(html).toContain('class="comment"')
  })

  test('escapes html in source', () => {
    const html = highlightShell('$ echo <script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })

  test('handles indented prompts', () => {
    const html = highlightShell('  $ ls')
    expect(html).toContain('class="prompt"')
  })

  test('plain lines pass through escaped', () => {
    const html = highlightShell('plain text')
    expect(html).toContain('plain text')
    expect(html).not.toContain('class="prompt"')
  })
})

describe('CodeBlock', () => {
  test('attaches shadow root', () => {
    const el = document.createElement('code-block')
    expect(el.shadowRoot).toBeTruthy()
  })

  test('renders code attribute as text content', () => {
    const el = document.createElement('code-block')
    el.setAttribute('code', 'const x = 1')
    document.body.appendChild(el)
    expect(el.shadowRoot.querySelector('code').textContent).toBe('const x = 1')
    el.remove()
  })

  test('falls back to textContent when no code attr', () => {
    const el = document.createElement('code-block')
    el.textContent = 'fallback content'
    document.body.appendChild(el)
    expect(el.shadowRoot.querySelector('code').textContent).toContain('fallback content')
    el.remove()
  })

  test('shell lang triggers highlightShell output', () => {
    const el = document.createElement('code-block')
    el.setAttribute('lang', 'shell')
    el.setAttribute('code', '$ ls')
    document.body.appendChild(el)
    expect(el.shadowRoot.querySelector('code').innerHTML).toContain('class="prompt"')
    el.remove()
  })

  test('renders lang label', () => {
    const el = document.createElement('code-block')
    el.setAttribute('lang', 'shell')
    el.setAttribute('code', '$ ls')
    document.body.appendChild(el)
    expect(el.shadowRoot.querySelector('.lang').textContent).toBe('shell')
    el.remove()
  })

  test('attribute changes re-render', () => {
    const el = document.createElement('code-block')
    el.setAttribute('code', 'one')
    document.body.appendChild(el)
    el.setAttribute('code', 'two')
    expect(el.shadowRoot.querySelector('code').textContent).toBe('two')
    el.remove()
  })

  test('copy button click attempts clipboard write', async () => {
    let captured = null
    const original = globalThis.navigator
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText: async (t) => { captured = t } } },
      writable: true, configurable: true,
    })
    const el = document.createElement('code-block')
    el.setAttribute('code', 'copy me')
    document.body.appendChild(el)
    el.shadowRoot.querySelector('.copy').click()
    await new Promise(r => setTimeout(r, 0))
    expect(captured).toBe('copy me')
    el.remove()
    Object.defineProperty(globalThis, 'navigator', { value: original, writable: true, configurable: true })
  })

  test('copy failure leaves copied class off and emits event', async () => {
    const original = globalThis.navigator
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText: async () => { throw new Error('blocked') } } },
      writable: true, configurable: true,
    })
    const el = document.createElement('code-block')
    el.setAttribute('code', 'copy me')
    document.body.appendChild(el)
    let event = null
    el.addEventListener('code-copied', (e) => { event = e })
    el.shadowRoot.querySelector('.copy').click()
    await new Promise(r => setTimeout(r, 0))
    expect(event.detail.ok).toBe(false)
    el.remove()
    Object.defineProperty(globalThis, 'navigator', { value: original, writable: true, configurable: true })
  })

  test('defineCodeBlock is idempotent', () => {
    defineCodeBlock('code-block')
    defineCodeBlock('code-block')
    expect(customElements.get('code-block')).toBe(CodeBlock)
  })
})
