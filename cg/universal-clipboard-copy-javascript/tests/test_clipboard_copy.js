import { copyToClipboard } from '../src/clipboard_copy.js'

describe('copyToClipboard', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    delete globalThis.navigator
  })

  test('rejects non-string input', async () => {
    await expect(copyToClipboard(123)).rejects.toThrow(TypeError)
  })

  test('uses navigator.clipboard.writeText when available', async () => {
    let captured = null
    globalThis.navigator = {
      clipboard: { writeText: async (t) => { captured = t } },
    }
    const result = await copyToClipboard('hello')
    expect(result).toBe(true)
    expect(captured).toBe('hello')
  })

  test('falls back to execCommand when clipboard.writeText throws', async () => {
    globalThis.navigator = {
      clipboard: { writeText: async () => { throw new Error('blocked') } },
    }
    document.execCommand = () => true
    const result = await copyToClipboard('hi')
    expect(result).toBe(true)
  })

  test('falls back to execCommand when navigator.clipboard is missing', async () => {
    globalThis.navigator = {}
    document.execCommand = () => true
    const result = await copyToClipboard('hello')
    expect(result).toBe(true)
  })

  test('fallback returns false when execCommand returns false', async () => {
    globalThis.navigator = {}
    document.execCommand = () => false
    const result = await copyToClipboard('hello')
    expect(result).toBe(false)
  })

  test('fallback returns false when execCommand throws', async () => {
    globalThis.navigator = {}
    document.execCommand = () => { throw new Error('nope') }
    const result = await copyToClipboard('hello')
    expect(result).toBe(false)
  })

  test('fallback removes the temporary textarea', async () => {
    globalThis.navigator = {}
    document.execCommand = () => true
    await copyToClipboard('hello')
    expect(document.querySelectorAll('textarea').length).toBe(0)
  })
})
