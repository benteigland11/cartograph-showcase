const TEMPLATE = `
  <div class="root" part="root">
    <div class="input-row" part="input-row">
      <svg class="icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <circle cx="7" cy="7" r="5"></circle>
        <path d="m11 11 4 4"></path>
      </svg>
      <input
        type="search"
        class="input"
        part="input"
        placeholder="Search the registry…"
        autocomplete="off"
        spellcheck="false"
        aria-label="Search widgets"
      />
      <span class="status" part="status"></span>
    </div>
    <ul class="results" part="results" role="listbox" hidden></ul>
    <p class="empty" part="empty" hidden></p>
  </div>
`

const STYLES = `
  :host {
    display: block;
    --ws-bg: var(--color-bg-elevated, #14171f);
    --ws-bg-hover: rgba(255, 195, 0, 0.06);
    --ws-fg: var(--color-fg, #f0f2f8);
    --ws-muted: var(--color-fg-muted, #8a90a0);
    --ws-subtle: var(--color-fg-subtle, #5a6070);
    --ws-border: var(--color-border, #22252f);
    --ws-accent: var(--color-accent, #FFC300);
    --ws-radius: var(--radius-lg, 12px);
    --ws-font: var(--font-sans, system-ui, sans-serif);
    --ws-mono: var(--font-mono, ui-monospace, monospace);
  }
  .root {
    background: var(--ws-bg);
    border: 1px solid var(--ws-border);
    border-radius: var(--ws-radius);
    overflow: hidden;
    font-family: var(--ws-font);
  }
  .input-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.875rem 1rem;
    border-bottom: 1px solid transparent;
    transition: border-color 200ms ease;
  }
  :host([data-open]) .input-row { border-bottom-color: var(--ws-border); }
  .icon { color: var(--ws-muted); flex-shrink: 0; }
  .input {
    flex: 1;
    background: transparent;
    border: 0;
    color: var(--ws-fg);
    font: inherit;
    font-size: 0.95rem;
    outline: none;
    min-width: 0;
  }
  .input::placeholder { color: var(--ws-subtle); }
  .status {
    font-family: var(--ws-mono);
    font-size: 0.72rem;
    color: var(--ws-subtle);
    flex-shrink: 0;
  }
  .results {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 22rem;
    overflow-y: auto;
  }
  .results[hidden] { display: none; }
  .row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.25rem 1rem;
    padding: 0.875rem 1rem;
    border-top: 1px solid var(--ws-border);
    cursor: pointer;
    transition: background 120ms ease;
  }
  .row:hover, .row.active { background: var(--ws-bg-hover); }
  .row .id { font-family: var(--ws-mono); font-size: 0.85rem; color: var(--ws-fg); font-weight: 500; }
  .row .meta { display: flex; gap: 0.5rem; align-items: center; font-size: 0.78rem; color: var(--ws-muted); justify-self: end; }
  .row .desc { grid-column: 1 / -1; font-size: 0.85rem; color: var(--ws-muted); line-height: 1.5; }
  .row .star { color: var(--ws-accent); }
  .empty {
    margin: 0;
    padding: 1.25rem 1rem;
    color: var(--ws-muted);
    font-size: 0.9rem;
    border-top: 1px solid var(--ws-border);
  }
  .empty[hidden] { display: none; }
`

function renderRow(w) {
  const stars = w.rating ? `<span class="star">★</span> ${Number(w.rating).toFixed(1)}` : ''
  const installs = w.install_count != null ? `· ${w.install_count} installs` : ''
  const meta = [stars, installs].filter(Boolean).join(' ')
  return `
    <li class="row" role="option" tabindex="0" data-id="${escapeAttr(w.id)}">
      <span class="id">${escapeHtml(w.id)}</span>
      <span class="meta">${meta}</span>
      <span class="desc">${escapeHtml(w.description ?? '')}</span>
    </li>
  `
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) }
function escapeAttr(s) { return escapeHtml(s) }

export class WidgetSearch extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`
    this._fetcher = null
    this._raf = null
    this._inflight = null
    this._lastQuery = ''
    this._debounceMs = 220
    this._minChars = 1
  }

  set fetcher(fn) {
    if (typeof fn !== 'function') throw new TypeError('fetcher must be a function')
    this._fetcher = fn
  }

  get debounceMs() { return this._debounceMs }
  set debounceMs(n) { if (Number.isFinite(n) && n >= 0) this._debounceMs = n }

  get minChars() { return this._minChars }
  set minChars(n) { if (Number.isFinite(n) && n >= 0) this._minChars = n }

  connectedCallback() {
    const input = this.shadowRoot.querySelector('.input')
    input.addEventListener('input', () => this._scheduleSearch(input.value))
    input.addEventListener('keydown', (e) => this._onKeydown(e))
    this.shadowRoot.querySelector('.results').addEventListener('click', (e) => this._onResultClick(e))
  }

  disconnectedCallback() {
    this._cancelTimer()
    if (this._inflight) this._inflight.abort()
  }

  _cancelTimer() {
    if (this._raf != null) cancelAnimationFrame(this._raf)
    this._raf = null
  }

  _scheduleSearch(query) {
    this._cancelTimer()
    const q = query.trim()
    if (q.length < this._minChars) {
      this._renderEmpty(null)
      this._setStatus('')
      return
    }
    const start = performance.now()
    const wait = (now) => {
      if (now - start >= this._debounceMs) this._runSearch(q)
      else this._raf = requestAnimationFrame(wait)
    }
    this._raf = requestAnimationFrame(wait)
  }

  async _runSearch(query) {
    if (!this._fetcher) {
      this._renderEmpty('No fetcher configured.')
      return
    }
    if (this._inflight) this._inflight.abort()
    const controller = new AbortController()
    this._inflight = controller
    this._lastQuery = query
    this._setStatus('searching…')
    try {
      const results = await this._fetcher(query, controller.signal)
      if (controller.signal.aborted || query !== this._lastQuery) return
      this._renderResults(Array.isArray(results) ? results : [])
    } catch (err) {
      if (err && err.name === 'AbortError') return
      this._renderEmpty(`Search failed: ${err?.message ?? 'unknown error'}`)
      this.dispatchEvent(new CustomEvent('search-error', { detail: { error: err }, bubbles: true, composed: true }))
    } finally {
      if (this._inflight === controller) this._inflight = null
    }
  }

  _renderResults(results) {
    const list = this.shadowRoot.querySelector('.results')
    const empty = this.shadowRoot.querySelector('.empty')
    if (results.length === 0) {
      list.hidden = true
      list.innerHTML = ''
      empty.hidden = false
      empty.textContent = 'No widgets matched.'
      this.removeAttribute('data-open')
      this._setStatus('0 results')
      return
    }
    list.innerHTML = results.map(renderRow).join('')
    list.hidden = false
    empty.hidden = true
    this.setAttribute('data-open', '')
    this._setStatus(`${results.length} results`)
  }

  _renderEmpty(message) {
    const list = this.shadowRoot.querySelector('.results')
    const empty = this.shadowRoot.querySelector('.empty')
    list.hidden = true
    list.innerHTML = ''
    if (message == null) {
      empty.hidden = true
      empty.textContent = ''
      this.removeAttribute('data-open')
      return
    }
    empty.hidden = false
    empty.textContent = message
    this.setAttribute('data-open', '')
  }

  _setStatus(text) {
    this.shadowRoot.querySelector('.status').textContent = text
  }

  _onResultClick(e) {
    const row = e.target.closest('.row')
    if (!row) return
    const id = row.getAttribute('data-id')
    this.dispatchEvent(new CustomEvent('widget-selected', {
      detail: { id, source: row },
      bubbles: true,
      composed: true,
    }))
  }

  _onKeydown(e) {
    const rows = Array.from(this.shadowRoot.querySelectorAll('.row'))
    if (rows.length === 0) return
    const active = rows.findIndex((r) => r.classList.contains('active'))
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = active < 0 ? 0 : Math.min(rows.length - 1, active + 1)
      this._setActive(rows, next)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = active <= 0 ? rows.length - 1 : active - 1
      this._setActive(rows, next)
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      rows[active].click()
    } else if (e.key === 'Escape') {
      this._renderEmpty(null)
      this._setStatus('')
    }
  }

  _setActive(rows, index) {
    rows.forEach((r, i) => r.classList.toggle('active', i === index))
    rows[index].scrollIntoView({ block: 'nearest' })
  }
}

export function defineWidgetSearch(tag = 'widget-search') {
  if (!customElements.get(tag)) customElements.define(tag, WidgetSearch)
}
