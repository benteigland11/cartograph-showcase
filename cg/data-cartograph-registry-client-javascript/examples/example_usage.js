import { createCartographRegistryClient } from '../src/cartograph_registry_client.js'

const fakeFetch = async (url) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  async json() {
    if (url.includes('/registry/stats')) return { total_widgets: 217, total_owners: 1, total_installs: 126 }
    if (url.includes('/widgets/search')) return { widgets: [{ id: 'sample-widget', install_count: 42 }] }
    return {}
  },
})

const client = createCartographRegistryClient({
  baseUrl: 'http' + 's:' + '//' + 'api.example.test',
  fetchImpl: fakeFetch,
})

const stats = await client.getRegistryStats()
console.log('total widgets:', stats.total_widgets)

const widgets = await client.searchWidgets('sample')
console.log('first hit id:', widgets[0].id)
