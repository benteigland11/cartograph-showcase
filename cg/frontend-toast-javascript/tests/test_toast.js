import { showToast, clearToasts } from '../src/toast.js'

globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)

function flush(ms = 30) { return new Promise((r) => setTimeout(r, ms)) }

describe('showToast', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
  })

  test('rejects non-string message', () => {
    expect(() => showToast(123)).toThrow(TypeError)
  })

  test('creates a stack and a toast element', () => {
    showToast('hi')
    expect(document.getElementById('toast-stack')).toBeTruthy()
    expect(document.querySelectorAll('.toast').length).toBe(1)
  })

  test('renders message text safely (no html injection)', () => {
    showToast('<script>x</script>')
    const body = document.querySelector('.toast .body')
    expect(body.textContent).toBe('<script>x</script>')
    expect(document.querySelector('.toast script')).toBeFalsy()
  })

  test('default variant is info', () => {
    showToast('hi')
    expect(document.querySelector('.toast').classList.contains('info')).toBe(true)
  })

  test('success variant adds success class', () => {
    showToast('done', { variant: 'success' })
    expect(document.querySelector('.toast').classList.contains('success')).toBe(true)
  })

  test('error variant adds error class', () => {
    showToast('boom', { variant: 'error' })
    expect(document.querySelector('.toast').classList.contains('error')).toBe(true)
  })

  test('dismissible toast renders a close button', () => {
    showToast('hi')
    expect(document.querySelector('.toast .close')).toBeTruthy()
  })

  test('non-dismissible toast omits close button', () => {
    showToast('hi', { dismissible: false })
    expect(document.querySelector('.toast .close')).toBeFalsy()
  })

  test('clicking close dismisses the toast', async () => {
    const { dismiss } = showToast('hi', { duration: 0 })
    document.querySelector('.toast .close').click()
    await flush(300)
    expect(document.querySelectorAll('.toast').length).toBe(0)
  })

  test('returned dismiss handle removes the toast', async () => {
    const { dismiss } = showToast('hi', { duration: 0 })
    dismiss()
    await flush(300)
    expect(document.querySelectorAll('.toast').length).toBe(0)
  })

  test('dismiss is idempotent', () => {
    const { dismiss } = showToast('hi', { duration: 0 })
    dismiss()
    expect(() => dismiss()).not.toThrow()
  })

  test('multiple toasts stack', () => {
    showToast('one')
    showToast('two')
    showToast('three')
    expect(document.querySelectorAll('.toast').length).toBe(3)
  })

  test('reuses existing stack on repeat calls', () => {
    showToast('a')
    showToast('b')
    expect(document.querySelectorAll('#toast-stack').length).toBe(1)
  })

  test('honors custom stackId', () => {
    showToast('hi', { stackId: 'my-stack' })
    expect(document.getElementById('my-stack')).toBeTruthy()
  })

  test('hover pauses auto-dismiss', async () => {
    const { element } = showToast('hi', { duration: 50 })
    element.dispatchEvent(new MouseEvent('mouseenter'))
    await flush(120)
    expect(document.querySelectorAll('.toast').length).toBe(1)
    element.dispatchEvent(new MouseEvent('mouseleave'))
  })

  test('clearToasts empties the stack', () => {
    showToast('a')
    showToast('b')
    clearToasts()
    expect(document.querySelectorAll('.toast').length).toBe(0)
  })

  test('clearToasts on missing stack is a no-op', () => {
    expect(() => clearToasts('nonexistent')).not.toThrow()
  })

  test('unknown variant falls back to info icon', () => {
    showToast('weird', { variant: 'mystery' })
    const icon = document.querySelector('.toast .icon')
    expect(icon.textContent).toBe('●')
  })
})
