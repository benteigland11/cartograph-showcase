const DEFAULTS = {
  bg: '#0a0b10',
  fg: '#f0f2f8',
  font: 'system-ui, -apple-system, sans-serif',
  durationMs: 280,
  readyClass: 'is-ready',
  colorScheme: 'dark',
}

export function buildLoadFadeCss(options = {}) {
  const o = { ...DEFAULTS, ...options }
  return `
    html { background: ${o.bg}; color-scheme: ${o.colorScheme}; }
    body {
      background: ${o.bg};
      color: ${o.fg};
      margin: 0;
      font-family: ${o.font};
      opacity: 0;
      transition: opacity ${o.durationMs}ms ease;
    }
    body.${o.readyClass} { opacity: 1; }
  `.trim()
}

export function injectLoadFadeStyles(options = {}, id = 'page-load-fade-styles') {
  if (document.getElementById(id)) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = buildLoadFadeCss(options)
  document.head.appendChild(style)
}

export function markReady({ readyClass = DEFAULTS.readyClass, target } = {}) {
  const body = target ?? document.body
  if (!body) return false
  body.classList.add(readyClass)
  return true
}

export function whenReady(callback, { event = 'load' } = {}) {
  if (typeof callback !== 'function') throw new TypeError('callback must be a function')
  if (document.readyState === 'complete' || (event === 'DOMContentLoaded' && document.readyState !== 'loading')) {
    callback()
  } else {
    window.addEventListener(event, callback, { once: true })
  }
}
