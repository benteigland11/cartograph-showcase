export async function copyToClipboard(text) {
  if (typeof text !== 'string') {
    throw new TypeError('text must be a string')
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return fallbackCopy(text)
    }
  }
  return fallbackCopy(text)
}

function fallbackCopy(text) {
  if (typeof document === 'undefined') return false
  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  let ok = false
  try {
    ok = document.execCommand && document.execCommand('copy')
  } catch {
    ok = false
  }
  document.body.removeChild(ta)
  return !!ok
}
