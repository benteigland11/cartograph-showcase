const TEMPLATE = `
  <div class="window" part="window">
    <div class="chrome" part="chrome">
      <span class="dot red"></span>
      <span class="dot yellow"></span>
      <span class="dot green"></span>
      <span class="title" part="title"><slot name="title">terminal</slot></span>
    </div>
    <div class="screen" part="screen"></div>
  </div>
`

const STYLES = `
  :host {
    display: block;
    --tm-bg: var(--color-bg-sunken, #06070b);
    --tm-fg: var(--color-fg, #f0f2f8);
    --tm-muted: var(--color-fg-muted, #8a90a0);
    --tm-prompt: var(--color-accent, #7dd3fc);
    --tm-border: var(--color-border, #22252f);
    --tm-radius: var(--radius-lg, 12px);
    --tm-font: var(--font-mono, ui-monospace, monospace);
  }
  .window {
    background: var(--tm-bg);
    border: 1px solid var(--tm-border);
    border-radius: var(--tm-radius);
    overflow: hidden;
    box-shadow: var(--tm-shadow, 0 12px 40px rgba(0, 0, 0, 0.5));
  }
  .chrome {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.625rem 0.875rem;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid var(--tm-border);
  }
  .dot { width: 11px; height: 11px; border-radius: 50%; background: #444; }
  .red { background: #ff5f56; }
  .yellow { background: #ffbd2e; }
  .green { background: #27c93f; }
  .title { margin-left: 0.75rem; font: 0.78rem var(--tm-font); color: var(--tm-muted); }
  .screen {
    padding: 1.25rem 1.25rem 1.5rem;
    font: 0.9rem/1.6 var(--tm-font);
    color: var(--tm-fg);
    min-height: var(--tm-min-height, 12rem);
    white-space: pre-wrap;
    word-break: break-word;
  }
  .line { display: block; }
  .prompt { color: var(--tm-prompt); user-select: none; margin-right: 0.5rem; }
  .output { color: var(--tm-muted); }
  .cursor {
    display: inline-block;
    width: 0.55ch;
    height: 1em;
    vertical-align: text-bottom;
    background: var(--tm-fg);
    margin-left: 1px;
    animation: tm-blink 1s steps(1) infinite;
  }
  @keyframes tm-blink { 50% { opacity: 0; } }
`

export class TerminalMock extends HTMLElement {
  static get observedAttributes() { return ['autoplay', 'speed'] }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`
    this._lines = []
    this._raf = null
  }

  connectedCallback() {
    if (!this._lines.length) this._tryParseAttribute()
    if (this.hasAttribute('autoplay')) this.play()
  }

  disconnectedCallback() {
    this._stop()
  }

  set lines(value) {
    if (!Array.isArray(value)) throw new TypeError('lines must be an array')
    this._lines = value
  }
  get lines() { return this._lines }

  get speed() {
    const n = Number(this.getAttribute('speed'))
    return Number.isFinite(n) && n > 0 ? n : 35
  }

  _tryParseAttribute() {
    const raw = this.getAttribute('lines')
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) this._lines = parsed
    } catch {
      // ignore parse errors — caller can use property setter
    }
  }

  play() {
    this._stop()
    const screen = this.shadowRoot.querySelector('.screen')
    screen.innerHTML = ''
    this._runQueue(screen, 0)
  }

  _stop() {
    if (this._raf) {
      cancelAnimationFrame(this._raf)
      this._raf = null
    }
  }

  _wait(ms, done) {
    const start = performance.now()
    const tick = (now) => {
      if (now - start >= ms) done()
      else this._raf = requestAnimationFrame(tick)
    }
    this._raf = requestAnimationFrame(tick)
  }

  _runQueue(screen, index) {
    if (index >= this._lines.length) {
      this._appendCursor(screen)
      this.dispatchEvent(new CustomEvent('terminal-complete', { bubbles: true, composed: true }))
      return
    }
    const line = this._lines[index]
    if (line.output != null) {
      const el = document.createElement('span')
      el.className = 'line output'
      el.textContent = line.output + '\n'
      screen.appendChild(el)
      this._wait(line.delay ?? 250, () => this._runQueue(screen, index + 1))
      return
    }
    const promptText = line.prompt ?? '$ '
    const text = line.text ?? ''
    const lineEl = document.createElement('span')
    lineEl.className = 'line'
    const promptEl = document.createElement('span')
    promptEl.className = 'prompt'
    promptEl.textContent = promptText
    const textEl = document.createElement('span')
    lineEl.append(promptEl, textEl)
    screen.appendChild(lineEl)
    this._typeChars(textEl, text, 0, () => {
      lineEl.append(document.createTextNode('\n'))
      this._wait(line.delay ?? 400, () => this._runQueue(screen, index + 1))
    })
  }

  _typeChars(target, text, i, done) {
    if (i >= text.length) { done(); return }
    target.textContent += text[i]
    this._wait(this.speed, () => this._typeChars(target, text, i + 1, done))
  }

  _appendCursor(screen) {
    const cursor = document.createElement('span')
    cursor.className = 'cursor'
    screen.appendChild(cursor)
  }
}

export function defineTerminalMock(tag = 'terminal-mock') {
  if (!customElements.get(tag)) customElements.define(tag, TerminalMock)
}
