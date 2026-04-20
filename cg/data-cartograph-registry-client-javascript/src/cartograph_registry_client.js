const SCHEME = 'http' + 's:' + '//'
const DEFAULT_HOST = 'api.cartograph.tools'

const DEFAULTS = {
  baseUrl: SCHEME + DEFAULT_HOST,
  fetchImpl: typeof fetch !== 'undefined' ? fetch.bind(globalThis) : null,
}

function buildUrl(baseUrl, path, params) {
  const url = new URL(path.replace(/^\/+/, ''), baseUrl.endsWith('/') ? baseUrl : baseUrl + '/')
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v != null) url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

export function createCartographRegistryClient(options = {}) {
  const opts = { ...DEFAULTS, ...options }
  if (typeof opts.fetchImpl !== 'function') {
    throw new TypeError('fetch implementation required (pass options.fetchImpl in non-browser environments)')
  }

  async function request(path, { params, signal } = {}) {
    const url = buildUrl(opts.baseUrl, path, params)
    const res = await opts.fetchImpl(url, { signal })
    if (!res.ok) {
      throw new Error(`registry ${res.status} ${res.statusText} for ${path}`)
    }
    return res.json()
  }

  return {
    /** GET /v1/registry/stats — aggregate counters, breakdowns, top lists, freshest. */
    async getRegistryStats({ signal } = {}) {
      return request('/v1/registry/stats', { signal })
    },

    /** GET /v1/widgets/search?q=... — array of matching widget summaries. */
    async searchWidgets(query, { signal } = {}) {
      if (typeof query !== 'string' || !query.trim()) {
        throw new TypeError('query must be a non-empty string')
      }
      const data = await request('/v1/widgets/search', { params: { q: query.trim() }, signal })
      return data.widgets ?? []
    },

    get baseUrl() { return opts.baseUrl },
  }
}
