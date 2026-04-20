const TEMPLATE = `<span class="output" part="output"></span>`

const STYLES = `
  :host { display: inline-block; }
  .output {
    font-family: var(--ts-font, inherit);
    color: var(--ts-color, inherit);
    white-space: pre;
  }
  .scrambled { color: var(--ts-scrambled-color, var(--ts-color, inherit)); opacity: var(--ts-scrambled-opacity, 0.7); }
`

export class TextScramble extends HTMLElement {
  static get observedAttributes() { return ['text', 'autoplay'] }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`
    this._raf = null
    this._target = ''
    this._frame = 0
    this._queue = []
    this._resolveDone = null
  }

  get charset() {
    return this.getAttribute('charset') ?? '!<>-_\\/[]{}—=+*^?#________'
  }
  get speed() {
    const raw = this.getAttribute('speed')
    if (raw == null) return 1
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : 1
  }
  get text() { return this._target }
  set text(v) { this.setAttribute('text', String(v)) }

  connectedCallback() {
    if (!this.hasAttribute('text') && this.textContent.trim()) {
      this.setAttribute('text', this.textContent.trim())
      this.textContent = ''
    }
    if (this.hasAttribute('autoplay')) this.play()
    else this._renderFinal(this.getAttribute('text') ?? '')
  }

  disconnectedCallback() {
    if (this._raf != null) cancelAnimationFrame(this._raf)
  }

  attributeChangedCallback(name) {
    if (name === 'text' && this.isConnected && !this.hasAttribute('autoplay')) {
      this._renderFinal(this.getAttribute('text') ?? '')
    }
  }

  play(newText) {
    const next = newText ?? this.getAttribute('text') ?? ''
    const prev = this._target
    this._target = next
    if (this._raf != null) cancelAnimationFrame(this._raf)
    const length = Math.max(prev.length, next.length)
    this._queue = []
    for (let i = 0; i < length; i++) {
      const from = prev[i] ?? ''
      const to = next[i] ?? ''
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      this._queue.push({ from, to, start, end, char: '' })
    }
    this._frame = 0
    return new Promise((resolve) => {
      this._resolveDone = resolve
      this._tick()
    })
  }

  _tick = () => {
    let output = ''
    let complete = 0
    for (const item of this._queue) {
      if (this._frame >= item.end) {
        complete++
        output += item.to
      } else if (this._frame >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = this._randomChar()
        }
        output += `<span class="scrambled">${item.char}</span>`
      } else {
        output += item.from
      }
    }
    this.shadowRoot.querySelector('.output').innerHTML = output
    if (complete === this._queue.length) {
      this._resolveDone?.()
      this._resolveDone = null
      return
    }
    this._frame += this.speed
    this._raf = requestAnimationFrame(this._tick)
  }

  _renderFinal(text) {
    this.shadowRoot.querySelector('.output').textContent = text
  }

  _randomChar() {
    const c = this.charset
    return c[Math.floor(Math.random() * c.length)]
  }
}

export function defineTextScramble(tag = 'text-scramble') {
  if (!customElements.get(tag)) customElements.define(tag, TextScramble)
}
