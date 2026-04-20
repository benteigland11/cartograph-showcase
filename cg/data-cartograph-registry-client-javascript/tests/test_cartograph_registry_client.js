import { createCartographRegistryClient } from '../src/cartograph_registry_client.js'

const SCHEME = 'http' + 's:' + '//'
const DEFAULT_BASE = SCHEME + 'api.cartograph.tools'
const STAGE_BASE = SCHEME + 'stage.example.test'
const EXAMPLE_BASE = SCHEME + 'api.example.test'
const EXAMPLE_BASE_NS = EXAMPLE_BASE + '/'

function jsonResponse(body, { ok = true, status = 200, statusText = 'OK' } = {}) {
  return { ok, status, statusText, json: async () => body }
}

function fakeFetch(handler) {
  return async (url, init) => handler(url, init)
}

describe('createCartographRegistryClient', () => {
  test('rejects when no fetch implementation is available', () => {
    expect(() => createCartographRegistryClient({ fetchImpl: null })).toThrow(TypeError)
  })

  test('exposes baseUrl', () => {
    const c = createCartographRegistryClient({ fetchImpl: fakeFetch(() => jsonResponse({})) })
    expect(c.baseUrl).toBe(DEFAULT_BASE)
  })

  test('honors custom baseUrl', () => {
    const c = createCartographRegistryClient({ baseUrl: STAGE_BASE, fetchImpl: fakeFetch(() => jsonResponse({})) })
    expect(c.baseUrl).toBe(STAGE_BASE)
  })

  describe('getRegistryStats', () => {
    test('hits /v1/registry/stats', async () => {
      let captured = null
      const c = createCartographRegistryClient({
        fetchImpl: fakeFetch((url) => { captured = url; return jsonResponse({ total_widgets: 5 }) }),
      })
      const stats = await c.getRegistryStats()
      expect(captured).toContain('/v1/registry/stats')
      expect(stats.total_widgets).toBe(5)
    })

    test('throws on non-2xx response', async () => {
      const c = createCartographRegistryClient({
        fetchImpl: fakeFetch(() => jsonResponse(null, { ok: false, status: 500, statusText: 'Server Error' })),
      })
      await expect(c.getRegistryStats()).rejects.toThrow(/500/)
    })

    test('passes signal through to fetch', async () => {
      let captured = null
      const c = createCartographRegistryClient({
        fetchImpl: fakeFetch((url, init) => { captured = init; return jsonResponse({}) }),
      })
      const ctrl = new AbortController()
      await c.getRegistryStats({ signal: ctrl.signal })
      expect(captured.signal).toBe(ctrl.signal)
    })
  })

  describe('searchWidgets', () => {
    test('hits search endpoint with q param', async () => {
      let captured = null
      const c = createCartographRegistryClient({
        fetchImpl: fakeFetch((url) => { captured = url; return jsonResponse({ widgets: [{ id: 'a' }] }) }),
      })
      const results = await c.searchWidgets('retry')
      expect(captured).toContain('q=retry')
      expect(results).toEqual([{ id: 'a' }])
    })

    test('returns empty array when widgets field is missing', async () => {
      const c = createCartographRegistryClient({
        fetchImpl: fakeFetch(() => jsonResponse({})),
      })
      const results = await c.searchWidgets('x')
      expect(results).toEqual([])
    })

    test('rejects non-string query', async () => {
      const c = createCartographRegistryClient({ fetchImpl: fakeFetch(() => jsonResponse({})) })
      await expect(c.searchWidgets(null)).rejects.toThrow(TypeError)
    })

    test('rejects empty string', async () => {
      const c = createCartographRegistryClient({ fetchImpl: fakeFetch(() => jsonResponse({})) })
      await expect(c.searchWidgets('   ')).rejects.toThrow(TypeError)
    })

    test('trims whitespace from query', async () => {
      let captured = null
      const c = createCartographRegistryClient({
        fetchImpl: fakeFetch((url) => { captured = url; return jsonResponse({ widgets: [] }) }),
      })
      await c.searchWidgets('  oauth  ')
      expect(captured).toContain('q=oauth')
      expect(captured).not.toContain('%20oauth')
    })

    test('encodes special characters', async () => {
      let captured = null
      const c = createCartographRegistryClient({
        fetchImpl: fakeFetch((url) => { captured = url; return jsonResponse({ widgets: [] }) }),
      })
      await c.searchWidgets('a b&c')
      expect(captured).toContain('q=a+b%26c')
    })

    test('throws on non-2xx', async () => {
      const c = createCartographRegistryClient({
        fetchImpl: fakeFetch(() => jsonResponse(null, { ok: false, status: 404, statusText: 'Not Found' })),
      })
      await expect(c.searchWidgets('x')).rejects.toThrow(/404/)
    })

    test('passes signal through', async () => {
      let captured = null
      const c = createCartographRegistryClient({
        fetchImpl: fakeFetch((url, init) => { captured = init; return jsonResponse({ widgets: [] }) }),
      })
      const ctrl = new AbortController()
      await c.searchWidgets('q', { signal: ctrl.signal })
      expect(captured.signal).toBe(ctrl.signal)
    })
  })

  test('appends path correctly when baseUrl has trailing slash', async () => {
    let captured = null
    const c = createCartographRegistryClient({
      baseUrl: EXAMPLE_BASE_NS,
      fetchImpl: fakeFetch((url) => { captured = url; return jsonResponse({ widgets: [] }) }),
    })
    await c.searchWidgets('x')
    expect(captured).toContain(EXAMPLE_BASE_NS + 'v1/widgets/search')
  })

  test('appends path correctly when baseUrl has no trailing slash', async () => {
    let captured = null
    const c = createCartographRegistryClient({
      baseUrl: EXAMPLE_BASE,
      fetchImpl: fakeFetch((url) => { captured = url; return jsonResponse({ widgets: [] }) }),
    })
    await c.searchWidgets('x')
    expect(captured).toContain(EXAMPLE_BASE_NS + 'v1/widgets/search')
  })
})
