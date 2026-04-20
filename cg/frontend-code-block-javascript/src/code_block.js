function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

export function highlightShell(source) {
  const lines = source.split('\n')
  return lines.map((line) => {
    if (/^\s*#/.test(line)) {
      return `<span class="comment">${escapeHtml(line)}</span>`
    }
    const promptMatch = line.match(/^(\s*)([$>]\s)(.*)$/)
    if (promptMatch) {
      const [, indent, prompt, rest] = promptMatch
      return `${indent}<span class="prompt">${escapeHtml(prompt)}</span>${highlightCommand(rest)}`
    }
    return escapeHtml(line)
  }).join('\n')
}

function highlightCommand(rest) {
  const tokens = rest.split(/(\s+)/)
  let seenCommand = false
  return tokens.map((tok) => {
    if (/^\s+$/.test(tok)) return tok
    if (!seenCommand && tok) {
      seenCommand = true
      return `<span class="command">${escapeHtml(tok)}</span>`
    }
    if (/^--?[\w-]+/.test(tok)) {
      return `<span class="flag">${escapeHtml(tok)}</span>`
    }
    if (/^"[^"]*"$|^'[^']*'$/.test(tok)) {
      return `<span class="string">${escapeHtml(tok)}</span>`
    }
    return `<span class="arg">${escapeHtml(tok)}</span>`
  }).join('')
}

const TEMPLATE = `
  <figure part="figure">
    <header part="header">
      <span class="lang" part="lang"></span>
      <button class="copy" part="copy" type="button" aria-label="Copy code">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="4" y="4" width="9" height="9" rx="1.5"></rect>
          <path d="M3 11V4a1 1 0 0 1 1-1h7"></path>
        </svg>
        <span class="label">Copy</span>
      </button>
    </header>
    <pre part="pre"><code part="code"></code></pre>
  </figure>
`

const STYLES = `
  :host {
    display: block;
    --cb-bg: var(--color-bg-sunken, #06070b);
    --cb-fg: var(--color-fg, #f0f2f8);
    --cb-muted: var(--color-fg-muted, #8a90a0);
    --cb-border: var(--color-border, #22252f);
    --cb-accent: var(--color-accent, #7dd3fc);
    --cb-radius: var(--radius-lg, 12px);
    --cb-font: var(--font-mono, ui-monospace, monospace);
  }
  figure {
    margin: 0;
    background: var(--cb-bg);
    border: 1px solid var(--cb-border);
    border-radius: var(--cb-radius);
    overflow: hidden;
    font-family: var(--cb-font);
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.875rem;
    border-bottom: 1px solid var(--cb-border);
    background: rgba(255, 255, 255, 0.02);
  }
  .lang {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--cb-muted);
  }
  .copy {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: transparent;
    color: var(--cb-muted);
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 0.25rem 0.55rem;
    font: inherit;
    font-size: 0.78rem;
    cursor: pointer;
    transition: color 120ms ease, background 120ms ease, border-color 120ms ease;
  }
  .copy:hover, .copy:focus-visible { color: var(--cb-fg); background: rgba(255,255,255,0.04); border-color: var(--cb-border); }
  .copy.copied { color: var(--cb-accent); border-color: var(--cb-accent); }
  pre { margin: 0; padding: 1rem 1.125rem; overflow-x: auto; font-size: 0.85rem; line-height: 1.6; color: var(--cb-fg); }
  code { display: block; white-space: pre; }
  .prompt { color: var(--cb-muted); user-select: none; }
  .command { color: var(--cb-accent); font-weight: 500; }
  .flag { color: #c4b5fd; }
  .string { color: #fde68a; }
  .arg { color: var(--cb-fg); }
  .comment { color: var(--cb-muted); font-style: italic; }
`

export class CodeBlock extends HTMLElement {
  static get observedAttributes() { return ['code', 'lang'] }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`
  }

  connectedCallback() {
    this._render()
    this.shadowRoot.querySelector('.copy').addEventListener('click', () => this._copy())
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this._render()
  }

  get code() { return this.getAttribute('code') ?? this.textContent.trim() }
  get lang() { return this.getAttribute('lang') || '' }

  _render() {
    const code = this.code
    const lang = this.lang
    const codeEl = this.shadowRoot.querySelector('code')
    const langEl = this.shadowRoot.querySelector('.lang')
    if (lang === 'shell' || lang === 'bash' || lang === 'sh') {
      codeEl.innerHTML = highlightShell(code)
    } else {
      codeEl.textContent = code
    }
    langEl.textContent = lang
  }

  async _copy() {
    const btn = this.shadowRoot.querySelector('.copy')
    const label = btn.querySelector('.label')
    const original = label.textContent
    let ok = false
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(this.code)
        ok = true
      }
    } catch {
      ok = false
    }
    btn.classList.toggle('copied', ok)
    label.textContent = ok ? 'Copied' : 'Failed'
    this.dispatchEvent(new CustomEvent('code-copied', { detail: { ok }, bubbles: true, composed: true }))
    setTimeout(() => {
      btn.classList.remove('copied')
      label.textContent = original
    }, 1500)
  }
}

export function defineCodeBlock(tag = 'code-block') {
  if (!customElements.get(tag)) customElements.define(tag, CodeBlock)
}
