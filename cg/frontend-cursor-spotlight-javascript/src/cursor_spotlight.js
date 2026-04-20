export function attachSpotlight(target, {
  xVar = '--spotlight-x',
  yVar = '--spotlight-y',
  showVar = '--spotlight-show',
  unit = 'px',
} = {}) {
  if (!target || typeof target.addEventListener !== 'function') {
    throw new TypeError('target must be an EventTarget element')
  }

  const onMove = (e) => {
    const rect = target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    target.style.setProperty(xVar, `${x}${unit}`)
    target.style.setProperty(yVar, `${y}${unit}`)
    target.style.setProperty(showVar, '1')
  }
  const onLeave = () => {
    target.style.setProperty(showVar, '0')
  }

  target.addEventListener('pointermove', onMove)
  target.addEventListener('pointerleave', onLeave)

  return {
    detach() {
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerleave', onLeave)
    },
  }
}

export const SPOTLIGHT_CSS = `
  [data-spotlight] {
    --spotlight-x: 50%;
    --spotlight-y: 50%;
    --spotlight-show: 0;
    --spotlight-color: rgba(255, 195, 0, 0.18);
    --spotlight-size: 320px;
    position: relative;
    isolation: isolate;
  }
  [data-spotlight]::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      var(--spotlight-size) circle at var(--spotlight-x) var(--spotlight-y),
      var(--spotlight-color),
      transparent 60%
    );
    opacity: var(--spotlight-show);
    transition: opacity 220ms ease;
    z-index: 0;
    border-radius: inherit;
  }
  [data-spotlight] > * { position: relative; z-index: 1; }
`

export function injectSpotlightStyles(id = 'cursor-spotlight-styles') {
  if (document.getElementById(id)) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = SPOTLIGHT_CSS
  document.head.appendChild(style)
}

export function attachSpotlightAll(selector = '[data-spotlight]', options) {
  const targets = document.querySelectorAll(selector)
  const handles = Array.from(targets).map((el) => attachSpotlight(el, options))
  return {
    detach() { handles.forEach((h) => h.detach()) },
  }
}
