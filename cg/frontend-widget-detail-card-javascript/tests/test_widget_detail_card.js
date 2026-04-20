import { WidgetDetailCard, defineWidgetDetailCard } from '../src/widget_detail_card.js'

defineWidgetDetailCard('widget-detail-card')

const sample = {
  id: 'frontend-foo-javascript',
  description: 'A test widget for the detail card.',
  version: '1.2.3',
  language: 'javascript',
  domain: 'frontend',
  owner: 'someone',
  install_count: 42,
  rating: 4.6,
  dependencies: ['happy-dom>=15.0.0', 'left-pad'],
}

describe('WidgetDetailCard', () => {
  test('attaches shadow root with article', () => {
    const el = document.createElement('widget-detail-card')
    expect(el.shadowRoot.querySelector('article')).toBeTruthy()
  })

  test('widget setter triggers render', () => {
    const el = document.createElement('widget-detail-card')
    document.body.appendChild(el)
    el.widget = sample
    expect(el.shadowRoot.querySelector('.id').textContent).toBe(sample.id)
    expect(el.shadowRoot.querySelector('.desc').textContent).toBe(sample.description)
    el.remove()
  })

  test('widget getter returns the set widget', () => {
    const el = document.createElement('widget-detail-card')
    el.widget = sample
    expect(el.widget).toBe(sample)
  })

  test('renders metadata bits joined with separator', () => {
    const el = document.createElement('widget-detail-card')
    document.body.appendChild(el)
    el.widget = sample
    const meta = el.shadowRoot.querySelector('.meta').textContent
    expect(meta).toContain('frontend')
    expect(meta).toContain('javascript')
    expect(meta).toContain('v1.2.3')
    expect(meta).toContain('@someone')
    expect(meta).toContain('42 installs')
    expect(meta).toContain('★ 4.6')
    el.remove()
  })

  test('renders install command with default prefix', () => {
    const el = document.createElement('widget-detail-card')
    document.body.appendChild(el)
    el.widget = sample
    expect(el.shadowRoot.querySelector('.cmd').textContent).toBe(`cartograph install ${sample.id}`)
    el.remove()
  })

  test('honors custom installPrefix', () => {
    const el = document.createElement('widget-detail-card')
    document.body.appendChild(el)
    el.installPrefix = 'cg add'
    el.widget = sample
    expect(el.shadowRoot.querySelector('.cmd').textContent).toBe(`cg add ${sample.id}`)
    el.remove()
  })

  test('installPrefix rejects non-string', () => {
    const el = document.createElement('widget-detail-card')
    expect(() => { el.installPrefix = 123 }).toThrow(TypeError)
  })

  test('renders dependency pills when present', () => {
    const el = document.createElement('widget-detail-card')
    document.body.appendChild(el)
    el.widget = sample
    const deps = el.shadowRoot.querySelector('.deps')
    expect(deps.hidden).toBe(false)
    expect(deps.querySelectorAll('li').length).toBe(2)
    el.remove()
  })

  test('hides deps when empty', () => {
    const el = document.createElement('widget-detail-card')
    document.body.appendChild(el)
    el.widget = { id: 'x', dependencies: [] }
    expect(el.shadowRoot.querySelector('.deps').hidden).toBe(true)
    el.remove()
  })

  test('hides deps when missing', () => {
    const el = document.createElement('widget-detail-card')
    document.body.appendChild(el)
    el.widget = { id: 'x' }
    expect(el.shadowRoot.querySelector('.deps').hidden).toBe(true)
    el.remove()
  })

  test('escapes html in dependency labels', () => {
    const el = document.createElement('widget-detail-card')
    document.body.appendChild(el)
    el.widget = { id: 'x', dependencies: ['<script>alert(1)</script>'] }
    expect(el.shadowRoot.querySelector('.deps').innerHTML).toContain('&lt;script&gt;')
    el.remove()
  })

  test('close button emits detail-close event', () => {
    const el = document.createElement('widget-detail-card')
    document.body.appendChild(el)
    let closed = false
    el.addEventListener('detail-close', () => { closed = true })
    el.shadowRoot.querySelector('.close').click()
    expect(closed).toBe(true)
    el.remove()
  })

  test('copy button writes to clipboard and emits install-copied', async () => {
    const original = globalThis.navigator
    let captured = null
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText: async (t) => { captured = t } } },
      writable: true, configurable: true,
    })
    const el = document.createElement('widget-detail-card')
    document.body.appendChild(el)
    el.widget = sample
    let event = null
    el.addEventListener('install-copied', (e) => { event = e })
    el.shadowRoot.querySelector('.copy').click()
    await new Promise(r => setTimeout(r, 0))
    expect(captured).toBe(`cartograph install ${sample.id}`)
    expect(event.detail.ok).toBe(true)
    el.remove()
    Object.defineProperty(globalThis, 'navigator', { value: original, writable: true, configurable: true })
  })

  test('copy failure emits install-copied with ok=false', async () => {
    const original = globalThis.navigator
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText: async () => { throw new Error('blocked') } } },
      writable: true, configurable: true,
    })
    const el = document.createElement('widget-detail-card')
    document.body.appendChild(el)
    el.widget = sample
    let event = null
    el.addEventListener('install-copied', (e) => { event = e })
    el.shadowRoot.querySelector('.copy').click()
    await new Promise(r => setTimeout(r, 0))
    expect(event.detail.ok).toBe(false)
    el.remove()
    Object.defineProperty(globalThis, 'navigator', { value: original, writable: true, configurable: true })
  })

  test('reads widget from data-widget attribute on connect', () => {
    const el = document.createElement('widget-detail-card')
    el.setAttribute('data-widget', JSON.stringify({ id: 'from-attr' }))
    document.body.appendChild(el)
    expect(el.widget.id).toBe('from-attr')
    el.remove()
  })

  test('ignores invalid data-widget JSON', () => {
    const el = document.createElement('widget-detail-card')
    el.setAttribute('data-widget', 'not json')
    document.body.appendChild(el)
    expect(el.widget).toBe(null)
    el.remove()
  })

  test('defineWidgetDetailCard is idempotent', () => {
    defineWidgetDetailCard('widget-detail-card')
    defineWidgetDetailCard('widget-detail-card')
    expect(customElements.get('widget-detail-card')).toBe(WidgetDetailCard)
  })
})
