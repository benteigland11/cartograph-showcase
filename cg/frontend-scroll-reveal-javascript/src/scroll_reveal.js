export function initScrollReveal({
  selector = '[data-reveal]',
  revealedClass = 'is-revealed',
  rootMargin = '0px 0px -10% 0px',
  threshold = 0.15,
  once = true,
  root = null,
} = {}) {
  if (typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll(selector).forEach((el) => el.classList.add(revealedClass))
    return { disconnect() {} }
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add(revealedClass)
        if (once) observer.unobserve(entry.target)
      } else if (!once) {
        entry.target.classList.remove(revealedClass)
      }
    }
  }, { rootMargin, threshold, root })

  const targets = (root || document).querySelectorAll(selector)
  targets.forEach((el) => observer.observe(el))

  return {
    disconnect() { observer.disconnect() },
    observe(el) { observer.observe(el) },
  }
}

export const REVEAL_CSS = `
  [data-reveal] {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: var(--reveal-delay, 0ms);
  }
  [data-reveal].is-revealed {
    opacity: 1;
    transform: translateY(0);
  }
  @media (prefers-reduced-motion: reduce) {
    [data-reveal] { opacity: 1; transform: none; transition: none; }
  }
`

export function injectRevealStyles(id = 'scroll-reveal-styles') {
  if (document.getElementById(id)) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = REVEAL_CSS
  document.head.appendChild(style)
}
