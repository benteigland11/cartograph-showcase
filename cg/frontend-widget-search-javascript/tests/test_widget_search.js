import { WidgetSearch, defineWidgetSearch } from '../src/widget_search.js'

globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)

defineWidgetSearch('widget-search')

function flush(ms = 30) { return new Promise((r) => setTimeout(r, ms)) }

function makeFetcher(results) {
  return async () => results
}

const sample = [
  { id: 'universal-retry-backoff-python', description: 'exponential backoff', rating: 4.8, install_count: 1234 },
  { id: 'frontend-code-block-javascript', description: 'syntax-highlighted code block', rating: 4.5, install_count: 200 },
]

describe('WidgetSearch', () => {
  test('attaches shadow root and renders input', () => {
    const el = document.createElement('widget-search')
    expect(el.shadowRoot.querySelector('.input')).toBeTruthy()
    expect(el.shadowRoot.querySelector('.results')).toBeTruthy()
  })

  test('fetcher setter rejects non-function', () => {
    const el = document.createElement('widget-search')
    expect(() => { el.fetcher = 'nope' }).toThrow(TypeError)
  })

  test('debounceMs setter accepts finite non-negative number', () => {
    const el = document.createElement('widget-search')
    el.debounceMs = 50
    expect(el.debounceMs).toBe(50)
    el.debounceMs = -1
    expect(el.debounceMs).toBe(50)
    el.debounceMs = 'abc'
    expect(el.debounceMs).toBe(50)
  })

  test('minChars setter accepts finite non-negative number', () => {
    const el = document.createElement('widget-search')
    el.minChars = 3
    expect(el.minChars).toBe(3)
    el.minChars = -1
    expect(el.minChars).toBe(3)
  })

  test('input below minChars renders no results', async () => {
    const el = document.createElement('widget-search')
    el.fetcher = makeFetcher(sample)
    el.debounceMs = 0
    el.minChars = 2
    document.body.appendChild(el)
    const input = el.shadowRoot.querySelector('.input')
    input.value = 'a'
    input.dispatchEvent(new Event('input'))
    await flush(50)
    expect(el.shadowRoot.querySelector('.results').hidden).toBe(true)
    el.remove()
  })

  test('input triggers fetcher and renders results', async () => {
    const el = document.createElement('widget-search')
    el.fetcher = makeFetcher(sample)
    el.debounceMs = 0
    document.body.appendChild(el)
    const input = el.shadowRoot.querySelector('.input')
    input.value = 'retry'
    input.dispatchEvent(new Event('input'))
    await flush(50)
    expect(el.shadowRoot.querySelectorAll('.row').length).toBe(2)
    expect(el.hasAttribute('data-open')).toBe(true)
    el.remove()
  })

  test('empty results show no-match message', async () => {
    const el = document.createElement('widget-search')
    el.fetcher = makeFetcher([])
    el.debounceMs = 0
    document.body.appendChild(el)
    const input = el.shadowRoot.querySelector('.input')
    input.value = 'xyz'
    input.dispatchEvent(new Event('input'))
    await flush(50)
    expect(el.shadowRoot.querySelector('.empty').hidden).toBe(false)
    el.remove()
  })

  test('missing fetcher shows configuration message', async () => {
    const el = document.createElement('widget-search')
    el.debounceMs = 0
    document.body.appendChild(el)
    const input = el.shadowRoot.querySelector('.input')
    input.value = 'retry'
    input.dispatchEvent(new Event('input'))
    await flush(50)
    expect(el.shadowRoot.querySelector('.empty').textContent).toContain('No fetcher')
    el.remove()
  })

  test('fetcher error fires search-error and shows message', async () => {
    const el = document.createElement('widget-search')
    el.fetcher = async () => { throw new Error('boom') }
    el.debounceMs = 0
    document.body.appendChild(el)
    let received = null
    el.addEventListener('search-error', (e) => { received = e.detail.error.message })
    const input = el.shadowRoot.querySelector('.input')
    input.value = 'retry'
    input.dispatchEvent(new Event('input'))
    await flush(50)
    expect(received).toBe('boom')
    expect(el.shadowRoot.querySelector('.empty').textContent).toContain('boom')
    el.remove()
  })

  test('clicking a result emits widget-selected with id', async () => {
    const el = document.createElement('widget-search')
    el.fetcher = makeFetcher(sample)
    el.debounceMs = 0
    document.body.appendChild(el)
    let received = null
    el.addEventListener('widget-selected', (e) => { received = e.detail.id })
    const input = el.shadowRoot.querySelector('.input')
    input.value = 'retry'
    input.dispatchEvent(new Event('input'))
    await flush(50)
    el.shadowRoot.querySelector('.row').click()
    expect(received).toBe('universal-retry-backoff-python')
    el.remove()
  })

  test('arrow keys navigate active row', async () => {
    const el = document.createElement('widget-search')
    el.fetcher = makeFetcher(sample)
    el.debounceMs = 0
    document.body.appendChild(el)
    const input = el.shadowRoot.querySelector('.input')
    input.value = 'retry'
    input.dispatchEvent(new Event('input'))
    await flush(50)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    expect(el.shadowRoot.querySelectorAll('.row')[0].classList.contains('active')).toBe(true)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    expect(el.shadowRoot.querySelectorAll('.row')[1].classList.contains('active')).toBe(true)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    expect(el.shadowRoot.querySelectorAll('.row')[0].classList.contains('active')).toBe(true)
    el.remove()
  })

  test('arrow up wraps to last when nothing active', async () => {
    const el = document.createElement('widget-search')
    el.fetcher = makeFetcher(sample)
    el.debounceMs = 0
    document.body.appendChild(el)
    const input = el.shadowRoot.querySelector('.input')
    input.value = 'retry'
    input.dispatchEvent(new Event('input'))
    await flush(50)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    expect(el.shadowRoot.querySelectorAll('.row')[1].classList.contains('active')).toBe(true)
    el.remove()
  })

  test('Enter on active row triggers selection', async () => {
    const el = document.createElement('widget-search')
    el.fetcher = makeFetcher(sample)
    el.debounceMs = 0
    document.body.appendChild(el)
    let received = null
    el.addEventListener('widget-selected', (e) => { received = e.detail.id })
    const input = el.shadowRoot.querySelector('.input')
    input.value = 'retry'
    input.dispatchEvent(new Event('input'))
    await flush(50)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(received).toBe(sample[0].id)
    el.remove()
  })

  test('Escape clears the dropdown', async () => {
    const el = document.createElement('widget-search')
    el.fetcher = makeFetcher(sample)
    el.debounceMs = 0
    document.body.appendChild(el)
    const input = el.shadowRoot.querySelector('.input')
    input.value = 'retry'
    input.dispatchEvent(new Event('input'))
    await flush(50)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(el.shadowRoot.querySelector('.results').hidden).toBe(true)
  })

  test('keydown with no rows is a no-op', async () => {
    const el = document.createElement('widget-search')
    document.body.appendChild(el)
    const input = el.shadowRoot.querySelector('.input')
    expect(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))).not.toThrow()
    el.remove()
  })

  test('disconnect aborts inflight request', async () => {
    let aborted = false
    const el = document.createElement('widget-search')
    el.fetcher = (q, signal) => new Promise(() => { signal.addEventListener('abort', () => { aborted = true }) })
    el.debounceMs = 0
    document.body.appendChild(el)
    const input = el.shadowRoot.querySelector('.input')
    input.value = 'retry'
    input.dispatchEvent(new Event('input'))
    await flush(20)
    el.remove()
    expect(aborted).toBe(true)
  })

  test('defineWidgetSearch is idempotent', () => {
    defineWidgetSearch('widget-search')
    defineWidgetSearch('widget-search')
    expect(customElements.get('widget-search')).toBe(WidgetSearch)
  })
})
