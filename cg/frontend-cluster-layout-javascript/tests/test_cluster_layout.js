import { ClusterLayout, defineClusterLayout } from '../src/cluster_layout.js'

defineClusterLayout('cluster-layout')

describe('ClusterLayout', () => {
  beforeEach(() => { document.head.innerHTML = ''; document.body.innerHTML = '' })

  test('does not attach a shadow root', () => {
    expect(document.createElement('cluster-layout').shadowRoot).toBe(null)
  })

  test('appending injects styles once', () => {
    document.body.append(document.createElement('cluster-layout'), document.createElement('cluster-layout'))
    expect(document.querySelectorAll('#cluster-layout-styles').length).toBe(1)
  })

  test('children stay in light DOM', () => {
    const cluster = document.createElement('cluster-layout')
    cluster.appendChild(document.createElement('span'))
    document.body.appendChild(cluster)
    expect(cluster.children.length).toBe(1)
  })

  test('injected styles target the tag selector with flex-wrap', () => {
    document.body.appendChild(document.createElement('cluster-layout'))
    const css = document.getElementById('cluster-layout-styles').textContent
    expect(css).toContain('cluster-layout')
    expect(css).toContain('flex-wrap: wrap')
    expect(css).toContain('--cluster-gap')
  })

  test('defineClusterLayout is idempotent', () => {
    defineClusterLayout('cluster-layout')
    defineClusterLayout('cluster-layout')
    expect(customElements.get('cluster-layout')).toBe(ClusterLayout)
  })
})
