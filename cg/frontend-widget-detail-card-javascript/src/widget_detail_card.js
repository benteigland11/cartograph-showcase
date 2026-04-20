const TEMPLATE = `
  <article part="card">
    <header>
      <h3 class="id" part="id"></h3>
      <button class="close" part="close" type="button" aria-label="Close">×</button>
    </header>
    <p class="meta" part="meta"></p>
    <p class="desc" part="desc"></p>
    <div class="install" part="install">
      <code class="cmd" part="cmd"></code>
      <button class="copy" part="copy" type="button">
        <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6">
          <rect x="4" y="4" width="9" height="9" rx="1.5"></rect>
          <path d="M3 11V4a1 1 0 0 1 1-1h7"></path>
        </svg>
        <span class="label">Copy</span>
      </button>
    </div>
    <ul class="deps" part="deps" hidden></ul>
  </article>
`

const STYLES = `
  :host {
    display: block;
    --dc-bg: var(--color-bg-elevated, #14171f);
    --dc-fg: var(--color-fg, #f0f2f8);
    --dc-muted: var(--color-fg-muted, #8a90a0);
    --dc-subtle: var(--color-fg-subtle, #5a6070);
    --dc-border: var(--color-border, #22252f);
    --dc-accent: var(--color-accent, #FFC300);
    --dc-radius: var(--radius-lg, 12px);
    --dc-font: var(--font-sans, system-ui, sans-serif);
    --dc-mono: var(--font-mono, ui-monospace, monospace);
  }
  article {
    background: var(--dc-bg);
    border: 1px solid var(--dc-border);
    border-left: 3px solid var(--dc-accent);
    border-radius: var(--dc-radius);
    padding: 1.25rem 1.25rem 1.5rem;
    font-family: var(--dc-font);
    color: var(--dc-fg);
  }
  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  .id {
    font: 500 0.92rem/1.4 var(--dc-mono);
    color: var(--dc-accent);
    margin: 0;
    word-break: break-all;
  }
  .close {
    background: transparent;
    border: 0;
    color: var(--dc-muted);
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 0.25rem;
    flex-shrink: 0;
  }
  .close:hover { color: var(--dc-fg); }
  .meta {
    margin: 0 0 0.75rem;
    color: var(--dc-subtle);
    font-size: 0.78rem;
    font-family: var(--dc-mono);
  }
  .desc {
    margin: 0 0 1rem;
    color: var(--dc-muted);
    font-size: 0.9rem;
    line-height: 1.55;
  }
  .install {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--dc-bg-sunken, rgba(0, 0, 0, 0.25));
    border: 1px solid var(--dc-border);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-family: var(--dc-mono);
  }
  .cmd {
    flex: 1;
    color: var(--dc-fg);
    font-size: 0.82rem;
    overflow-x: auto;
    white-space: nowrap;
    user-select: text;
  }
  .copy {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: transparent;
    color: var(--dc-muted);
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
    font: inherit;
    font-size: 0.75rem;
    cursor: pointer;
    transition: color 120ms ease, background 120ms ease, border-color 120ms ease;
  }
  .copy:hover { color: var(--dc-fg); background: rgba(255,255,255,0.04); border-color: var(--dc-border); }
  .copy.copied { color: var(--dc-accent); border-color: var(--dc-accent); }
  .deps {
    list-style: none;
    padding: 0;
    margin: 0.875rem 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .deps[hidden] { display: none; }
  .deps li {
    font-family: var(--dc-mono);
    font-size: 0.72rem;
    padding: 0.2rem 0.55rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--dc-border);
    border-radius: 999px;
    color: var(--dc-muted);
  }
`

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

export class WidgetDetailCard extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`
    this._widget = null
    this._installPrefix = 'cartograph install'
  }

  set widget(w) {
    this._widget = w
    this._render()
  }
  get widget() { return this._widget }

  set installPrefix(p) {
    if (typeof p !== 'string') throw new TypeError('installPrefix must be a string')
    this._installPrefix = p
    this._render()
  }
  get installPrefix() { return this._installPrefix }

  connectedCallback() {
    this.shadowRoot.querySelector('.close').addEventListener('click', () => this._close())
    this.shadowRoot.querySelector('.copy').addEventListener('click', () => this._copy())
    if (this._widget == null && this.hasAttribute('data-widget')) {
      try { this._widget = JSON.parse(this.getAttribute('data-widget')) } catch {}
    }
    this._render()
  }

  _close() {
    this.dispatchEvent(new CustomEvent('detail-close', { bubbles: true, composed: true }))
  }

  _render() {
    const w = this._widget
    if (!w) return
    const id = w.id ?? ''
    this.shadowRoot.querySelector('.id').textContent = id
    const bits = []
    if (w.domain) bits.push(w.domain)
    if (w.language) bits.push(w.language)
    if (w.version) bits.push(`v${w.version}`)
    if (w.owner) bits.push(`@${w.owner}`)
    if (w.install_count != null) bits.push(`${w.install_count} installs`)
    if (w.rating) bits.push(`★ ${Number(w.rating).toFixed(1)}`)
    this.shadowRoot.querySelector('.meta').textContent = bits.join(' · ')
    this.shadowRoot.querySelector('.desc').textContent = w.description ?? ''
    this.shadowRoot.querySelector('.cmd').textContent = `${this._installPrefix} ${id}`

    const deps = w.dependencies ?? []
    const depsEl = this.shadowRoot.querySelector('.deps')
    if (deps.length) {
      depsEl.hidden = false
      depsEl.innerHTML = deps.map((d) => `<li>${escapeHtml(d)}</li>`).join('')
    } else {
      depsEl.hidden = true
      depsEl.innerHTML = ''
    }
  }

  async _copy() {
    const cmd = this.shadowRoot.querySelector('.cmd').textContent
    const btn = this.shadowRoot.querySelector('.copy')
    const label = btn.querySelector('.label')
    const original = label.textContent
    let ok = false
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(cmd)
        ok = true
      }
    } catch {}
    btn.classList.toggle('copied', ok)
    label.textContent = ok ? 'Copied' : 'Failed'
    this.dispatchEvent(new CustomEvent('install-copied', { detail: { command: cmd, ok }, bubbles: true, composed: true }))
    setTimeout(() => {
      btn.classList.remove('copied')
      label.textContent = original
    }, 1500)
  }
}

export function defineWidgetDetailCard(tag = 'widget-detail-card') {
  if (!customElements.get(tag)) customElements.define(tag, WidgetDetailCard)
}
