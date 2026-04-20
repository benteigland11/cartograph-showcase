const STYLES = `
  .toast-stack {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 9999;
    pointer-events: none;
  }
  .toast {
    pointer-events: auto;
    background: var(--toast-bg, #14171f);
    color: var(--toast-fg, #f0f2f8);
    border: 1px solid var(--toast-border, #22252f);
    border-left: 3px solid var(--toast-accent, #FFC300);
    border-radius: var(--toast-radius, 8px);
    padding: 0.625rem 0.875rem 0.625rem 1rem;
    font-family: var(--toast-font, system-ui, sans-serif);
    font-size: 0.88rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    min-width: 14rem;
    max-width: 22rem;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    transform: translateX(120%);
    opacity: 0;
    transition: transform 240ms cubic-bezier(0.16,1,0.3,1), opacity 240ms ease;
  }
  .toast.is-shown { transform: translateX(0); opacity: 1; }
  .toast.is-leaving { transform: translateX(20%); opacity: 0; }
  .toast.success { border-left-color: var(--toast-success, #4ade80); }
  .toast.error { border-left-color: var(--toast-error, #f87171); }
  .toast .icon { flex-shrink: 0; opacity: 0.85; }
  .toast .body { flex: 1; line-height: 1.4; }
  .toast button.close {
    background: transparent;
    border: 0;
    color: var(--toast-fg, #f0f2f8);
    opacity: 0.5;
    cursor: pointer;
    font: inherit;
    padding: 0 0.25rem;
    transition: opacity 120ms ease;
  }
  .toast button.close:hover { opacity: 1; }
`

const ICONS = {
  info: '●',
  success: '✓',
  error: '!',
}

function ensureStack(stackId) {
  let stack = document.getElementById(stackId)
  if (!stack) {
    if (!document.getElementById(`${stackId}-styles`)) {
      const style = document.createElement('style')
      style.id = `${stackId}-styles`
      style.textContent = STYLES
      document.head.appendChild(style)
    }
    stack = document.createElement('div')
    stack.id = stackId
    stack.className = 'toast-stack'
    document.body.appendChild(stack)
  }
  return stack
}

export function showToast(message, {
  variant = 'info',
  duration = 2400,
  dismissible = true,
  stackId = 'toast-stack',
} = {}) {
  if (typeof message !== 'string') throw new TypeError('message must be a string')
  const stack = ensureStack(stackId)
  const toast = document.createElement('div')
  toast.className = `toast ${variant}`
  toast.innerHTML = `
    <span class="icon" aria-hidden="true">${ICONS[variant] ?? ICONS.info}</span>
    <span class="body"></span>
    ${dismissible ? '<button class="close" type="button" aria-label="Dismiss">×</button>' : ''}
  `
  toast.querySelector('.body').textContent = message
  stack.appendChild(toast)

  let raf = requestAnimationFrame(() => {
    raf = requestAnimationFrame(() => toast.classList.add('is-shown'))
  })

  let dismissed = false
  let leaveTimer = null
  let pauseStart = null
  let elapsed = 0

  const startWait = (ms) => {
    const start = performance.now()
    const tick = (now) => {
      if (dismissed) return
      if (now - start + elapsed >= ms) dismiss()
      else leaveTimer = requestAnimationFrame(tick)
    }
    leaveTimer = requestAnimationFrame(tick)
  }

  const dismiss = () => {
    if (dismissed) return
    dismissed = true
    if (leaveTimer != null) cancelAnimationFrame(leaveTimer)
    toast.classList.add('is-leaving')
    toast.classList.remove('is-shown')
    const removeRaf = (now) => {
      if (now - pauseStart >= 240 || !pauseStart) {
        toast.remove()
      } else {
        requestAnimationFrame(removeRaf)
      }
    }
    pauseStart = performance.now()
    requestAnimationFrame(removeRaf)
  }

  if (duration > 0) startWait(duration)

  if (dismissible) {
    toast.querySelector('.close').addEventListener('click', dismiss)
  }

  toast.addEventListener('mouseenter', () => {
    if (leaveTimer != null) {
      cancelAnimationFrame(leaveTimer)
      leaveTimer = null
      pauseStart = performance.now()
    }
  })
  toast.addEventListener('mouseleave', () => {
    if (pauseStart != null && duration > 0 && !dismissed) {
      pauseStart = null
      startWait(duration)
    }
  })

  return { dismiss, element: toast }
}

export function clearToasts(stackId = 'toast-stack') {
  const stack = document.getElementById(stackId)
  if (stack) stack.innerHTML = ''
}
