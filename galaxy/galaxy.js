import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { applyTokens } from '../cg/frontend-design-tokens-javascript/src/design_tokens.js'
import { applyMetaTags } from '../cg/frontend-meta-tags-javascript/src/meta_tags.js'
import { defineSiteNav } from '../cg/frontend-nav-bar-javascript/src/nav_bar.js'
import { defineCodeBlock } from '../cg/frontend-code-block-javascript/src/code_block.js'
import { createWidgetGalaxy, DOMAIN_COLORS } from '../cg/frontend-widget-galaxy-javascript/src/widget_galaxy.js'
import { showToast } from '../cg/frontend-toast-javascript/src/toast.js'

applyTokens({
  overrides: {
    color: {
      accent: '#FFC300',
      'accent-strong': '#FF9500',
    },
  },
})

applyMetaTags({
  title: 'Cartograph Galaxy — every widget in the registry',
  description: 'A 3D view of every widget in the Cartograph cloud registry.',
  url: 'https://benteigland11.github.io/cartograph-showcase/galaxy/',
  image: 'https://benteigland11.github.io/cartograph-showcase/og.png',
  themeColor: '#06070b',
  favicon: '../favicon.svg',
})

defineSiteNav('site-nav')
defineCodeBlock('code-block')

const status = document.getElementById('status')
const detail = document.getElementById('detail')
const detailId = document.getElementById('detail-id')
const detailMeta = document.getElementById('detail-meta')
const detailDesc = document.getElementById('detail-desc')
const detailCode = document.getElementById('detail-code')
const legend = document.getElementById('legend')

document.querySelector('.detail-close').addEventListener('click', () => { detail.hidden = true })

renderLegend()

const queries = ['cartograph', 'frontend', 'backend', 'universal', 'data', 'ml', 'security', 'infra', 'modeling', 'rtl', 'widget', 'utility', 'retry', 'parse', 'format']
const seen = new Map()

;(async () => {
  status.textContent = 'Querying the registry…'
  const results = await Promise.all(
    queries.map((q) => fetch(`https://api.cartograph.tools/v1/widgets/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.ok ? r.json() : { widgets: [] })
      .catch(() => ({ widgets: [] })))
  )
  for (const r of results) {
    for (const w of r.widgets ?? []) seen.set(w.id, w)
  }
  const widgets = Array.from(seen.values())
  if (widgets.length === 0) {
    status.textContent = 'No widgets returned. The galaxy is empty for now.'
    return
  }
  mount(widgets)
})()

function mount(widgets) {
  const canvas = document.getElementById('galaxy-canvas')
  const galaxy = createWidgetGalaxy(canvas, { THREE, OrbitControls }, {
    widgets,
    onSelect: (w) => showDetail(w),
  })
  galaxy.start()
  window.addEventListener('resize', () => galaxy.resize())
  status.textContent = `${widgets.length} widgets · drag to orbit · click a cube`
}

function showDetail(w) {
  detail.hidden = false
  detailId.textContent = w.id
  const bits = []
  if (w.domain) bits.push(w.domain)
  if (w.language) bits.push(w.language)
  if (w.version) bits.push(`v${w.version}`)
  if (w.install_count != null) bits.push(`${w.install_count} installs`)
  detailMeta.textContent = bits.join(' · ')
  detailDesc.textContent = w.description ?? ''
  detailCode.setAttribute('code', `$ cartograph install ${w.id}`)
  navigator.clipboard?.writeText(`cartograph install ${w.id}`).then(
    () => showToast('Install command copied', { variant: 'success', duration: 2000 }),
    () => {}
  )
}

function renderLegend() {
  const domains = ['frontend', 'backend', 'universal', 'data', 'ml', 'security', 'infra', 'modeling', 'rtl']
  legend.innerHTML = '<strong>Domain</strong>' + domains.map((d) => `
    <div class="legend-row">
      <span class="legend-swatch" style="background: #${DOMAIN_COLORS[d].toString(16).padStart(6, '0')}"></span>
      <span>${d}</span>
    </div>
  `).join('')
}
