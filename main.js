import { applyTokens } from './cg/frontend-design-tokens-javascript/src/design_tokens.js'
import { applyMetaTags } from './cg/frontend-meta-tags-javascript/src/meta_tags.js'
import { defineSiteNav } from './cg/frontend-nav-bar-javascript/src/nav_bar.js'
import { defineSiteFooter } from './cg/frontend-footer-javascript/src/footer.js'
import { defineHeroSection } from './cg/frontend-hero-section-javascript/src/hero_section.js'
import { defineFeatureGrid } from './cg/frontend-feature-grid-javascript/src/feature_grid.js'
import { defineCodeBlock } from './cg/frontend-code-block-javascript/src/code_block.js'
import { defineTerminalMock } from './cg/frontend-terminal-mock-javascript/src/terminal_mock.js'
import { initScrollReveal, injectRevealStyles } from './cg/frontend-scroll-reveal-javascript/src/scroll_reveal.js'
import { attachSpotlightAll, injectSpotlightStyles } from './cg/frontend-cursor-spotlight-javascript/src/cursor_spotlight.js'
import { defineWidgetSearch } from './cg/frontend-widget-search-javascript/src/widget_search.js'
import { defineWidgetDetailCard } from './cg/frontend-widget-detail-card-javascript/src/widget_detail_card.js'
import { showToast } from './cg/frontend-toast-javascript/src/toast.js'
import { defineStatsCounter } from './cg/frontend-stats-counter-javascript/src/stats_counter.js'
import { markReady } from './cg/frontend-page-load-fade-javascript/src/page_load_fade.js'
import { createCartographRegistryClient } from './cg/data-cartograph-registry-client-javascript/src/cartograph_registry_client.js'

const registry = createCartographRegistryClient()

applyTokens({
  overrides: {
    color: {
      accent: '#FFC300',
      'accent-strong': '#FF9500',
      'accent-soft': 'rgba(255, 195, 0, 0.12)',
    },
  },
})
injectRevealStyles()
injectSpotlightStyles()

applyMetaTags({
  title: 'Cartograph: code worth keeping',
  description: 'Code worth keeping. Write it once, iterate. A widget library manager for the code you actually want to reuse.',
  url: 'https://benteigland11.github.io/cartograph-showcase/',
  image: 'https://benteigland11.github.io/cartograph-showcase/og.png',
  siteName: 'Cartograph',
  themeColor: '#0a0b10',
  favicon: './favicon.svg',
  twitterSite: '@cartograph',
})

defineSiteNav('site-nav')
defineSiteFooter('site-footer')
defineHeroSection('hero-section')
defineFeatureGrid('feature-grid', 'feature-card')
defineCodeBlock('code-block')
defineTerminalMock('terminal-mock')
defineWidgetSearch('widget-search')
defineWidgetDetailCard('widget-detail-card')
defineStatsCounter('stats-counter')

const main = document.getElementById('top')

main.innerHTML = `
  <div class="hero-stage" data-spotlight>
  <hero-section layout="split">
    <span slot="eyebrow" id="hero-eyebrow">Cartograph · on PyPI</span>
    <span slot="headline">Code worth keeping. Write it once, iterate.</span>
    <span slot="subhead">A widget library manager for the code you actually want to reuse. Extract it once, version every change, share across every project.</span>
    <a slot="primary" class="btn btn-primary" href="https://github.com/benteigland11/Cartograph">Get started →</a>
    <a slot="secondary" class="btn btn-secondary" href="#features">See features</a>
    <terminal-mock
      slot="visual"
      data-reveal
      style="--reveal-delay: 100ms"
      autoplay
      speed="28"
      lines='[
        {"prompt":"$ ","text":"cartograph search oauth pkce","delay":600},
        {"output":"  security-oauth-pkce-javascript     · WebCrypto PKCE helpers for browsers"},
        {"output":"  universal-oauth-pkce-python        · Headless PKCE for native + loopback","delay":500},
        {"prompt":"$ ","text":"cartograph install security-oauth-pkce-javascript","delay":400},
        {"output":"✓ installed → cg/security-oauth-pkce-javascript  (v1.0.0)"}
      ]'
    ></terminal-mock>
  </hero-section>
  </div>

  <section id="stats" class="stats-strip">
    <div class="stats-row" data-reveal>
      <div class="stat">
        <stats-counter id="stat-widgets" target="0" duration="1800"></stats-counter>
        <span class="stat-label">widgets in the registry</span>
      </div>
      <div class="stat">
        <stats-counter id="stat-owners" target="0" duration="1800"></stats-counter>
        <span class="stat-label">owners contributing</span>
      </div>
      <div class="stat">
        <stats-counter id="stat-installs" target="0" duration="1800"></stats-counter>
        <span class="stat-label">total installs</span>
      </div>
    </div>
    <div class="freshest" data-reveal hidden>
      <p class="freshest-label">Fresh from the registry</p>
      <div class="freshest-list" id="freshest-list"></div>
    </div>
  </section>

  <hr class="divider" />

  <section id="why" class="bounded">
    <p class="section-eyebrow" data-reveal>The problem</p>
    <h2 class="section-title" data-reveal style="--reveal-delay: 60ms">Same code, different repos.</h2>
    <p class="section-lede" data-reveal style="--reveal-delay: 120ms">You wrote that PKCE flow. Or the JWT verifier. Or the webhook signature checker. Three times this year, in three projects. Each copy drifts. Each copy hides the same bug. None know about the others.</p>

    <div class="comparison" data-reveal style="--reveal-delay: 180ms">
      <div class="comparison-side">
        <p class="comparison-label">Without</p>
        <code-block lang="shell" code="$ grep -r 'pkce' ~/projects
project-a/auth.js:    generateCodeVerifier(...)
project-b/oauth/flow.ts: createPkceChallenge(...)
project-c/helpers/auth.js: makeS256(...)
$ # three implementations. zero shared fixes."></code-block>
      </div>
      <div class="comparison-side">
        <p class="comparison-label">With Cartograph</p>
        <code-block lang="shell" code="$ cartograph search oauth pkce
  security-oauth-pkce-javascript  · WebCrypto PKCE helpers
$ cartograph install security-oauth-pkce-javascript
✓ installed → cg/security-oauth-pkce-javascript  (v1.0.0)"></code-block>
      </div>
    </div>
  </section>

  <hr class="divider" />

  <section id="features" class="bounded">
    <p class="section-eyebrow" data-reveal>What it does</p>
    <h2 class="section-title" data-reveal style="--reveal-delay: 60ms">Six commands, one library.</h2>
    <p class="section-lede" data-reveal style="--reveal-delay: 120ms">Every step of the widget lifecycle is a single command. No build configs, no glue scripts.</p>
    <feature-grid data-reveal style="--reveal-delay: 180ms"></feature-grid>
  </section>

  <hr class="divider" />

  <section id="search" class="bounded">
    <p class="section-eyebrow" data-reveal>Try it now</p>
    <h2 class="section-title" data-reveal style="--reveal-delay: 60ms">Search the live registry.</h2>
    <p class="section-lede" data-reveal style="--reveal-delay: 120ms">This input is hitting <code style="font-family: var(--font-mono); color: var(--color-accent)">api.cartograph.tools</code> in real time. Type a keyword. Click a result for a detail card with a one-click install command.</p>
    <widget-search data-reveal style="--reveal-delay: 180ms" id="live-search"></widget-search>
    <div class="detail-slot" id="detail-slot" data-reveal style="--reveal-delay: 240ms" hidden></div>
  </section>

  <hr class="divider" />

  <section id="install" class="bounded">
    <p class="section-eyebrow" data-reveal>Install it</p>
    <h2 class="section-title" data-reveal style="--reveal-delay: 60ms">Pick a widget. Copy. Run.</h2>
    <p class="section-lede" data-reveal style="--reveal-delay: 120ms">Widgets land in <code style="font-family: var(--font-mono); color: var(--color-accent)">cg/</code> at your project root. No package manager required.</p>
    <code-block
      data-reveal
      style="--reveal-delay: 180ms"
      lang="shell"
      code="$ cartograph search retry
$ cartograph inspect universal-retry-backoff-python
$ cartograph install universal-retry-backoff-python
✓ installed → cg/universal-retry-backoff-python  (v1.2.0)
$ # done. import it from cg/ and ship."
    ></code-block>
  </section>

  <hr class="divider" />

  <section id="composed" class="bounded">
    <p class="section-eyebrow" data-reveal>Composed of</p>
    <h2 class="section-title" data-reveal style="--reveal-delay: 60ms">This site is its own demo.</h2>
    <p class="section-lede" data-reveal style="--reveal-delay: 120ms">Every section above was assembled from the widgets below: installed, not written from scratch. Click through to install any of them.</p>
    <ul class="composed-list" data-reveal style="--reveal-delay: 180ms" id="composed-list"></ul>
  </section>
`

const grid = main.querySelector('feature-grid')
const features = [
  { icon: '⌕', title: 'Search', body: 'Find widgets by query, domain, or language. Filter the catalog before installing anything.' },
  { icon: '↓', title: 'Install', body: 'One command lands the widget in cg/, fully self-contained: code, tests, examples, metadata.' },
  { icon: '✓', title: 'Validate', body: 'Tests, contamination scan, coverage gate. A widget is either valid or it does not check in.' },
  { icon: '⇡', title: 'Version', body: 'Semver bumps via bump flag. Cartograph manages the version field. You never hand-edit it.' },
  { icon: '☁', title: 'Publish', body: 'Push to the cloud registry with one command. Public or private, governed or open.' },
  { icon: '⇄', title: 'Share', body: 'Adopt, propose, sync. Widgets evolve through pull-request-style proposals across teams.' },
]
for (const f of features) {
  const card = document.createElement('feature-card')
  card.innerHTML = `
    <span slot="icon">${f.icon}</span>
    <span slot="title">${f.title}</span>
    ${f.body}
  `
  grid.appendChild(card)
}

const composed = main.querySelector('#composed-list')
const widgetIds = [
  'frontend-design-tokens-javascript',
  'frontend-meta-tags-javascript',
  'frontend-nav-bar-javascript',
  'frontend-footer-javascript',
  'frontend-hero-section-javascript',
  'frontend-feature-grid-javascript',
  'frontend-code-block-javascript',
  'frontend-terminal-mock-javascript',
  'frontend-scroll-reveal-javascript',
  'frontend-web-component-base-javascript',
  'frontend-event-bus-javascript',
  'universal-clipboard-copy-javascript',
]
for (const id of widgetIds) {
  const li = document.createElement('li')
  li.innerHTML = `<span class="dot"></span><strong>${id}</strong>`
  composed.appendChild(li)
}

const search = document.getElementById('live-search')
const detailSlot = document.getElementById('detail-slot')
const lastResults = new Map()

search.fetcher = async (query, signal) => {
  const widgets = await registry.searchWidgets(query, { signal })
  lastResults.clear()
  for (const w of widgets) lastResults.set(w.id, w)
  return widgets
}

search.addEventListener('search-error', (e) => {
  showToast(`Search failed: ${e.detail.error?.message ?? 'unknown'}`, { variant: 'error' })
})

search.addEventListener('widget-selected', (e) => {
  const widget = lastResults.get(e.detail.id) ?? { id: e.detail.id }
  let card = detailSlot.querySelector('widget-detail-card')
  if (!card) {
    card = document.createElement('widget-detail-card')
    card.addEventListener('detail-close', () => { detailSlot.hidden = true })
    card.addEventListener('install-copied', (ev) => {
      showToast(ev.detail.ok ? 'Install command copied' : 'Copy blocked. Run it manually.', {
        variant: ev.detail.ok ? 'success' : 'error',
      })
    })
    detailSlot.appendChild(card)
  }
  card.widget = widget
  detailSlot.hidden = false
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
})

;(async () => {
  try {
    const res = await fetch('https://pypi.org/pypi/cartograph-cli/json')
    if (!res.ok) return
    const data = await res.json()
    const v = data?.info?.version
    if (v) document.getElementById('hero-eyebrow').textContent = `cartograph-cli · v${v} on PyPI`
  } catch {}
})()

;(async () => {
  try {
    const stats = await registry.getRegistryStats()
    document.getElementById('stat-widgets').target = stats.total_widgets ?? 0
    document.getElementById('stat-owners').target = stats.total_owners ?? 0
    document.getElementById('stat-installs').target = stats.total_installs ?? 0
    renderFreshest(stats.freshest ?? [])
  } catch (err) {
    console.error('registry stats fetch failed', err)
  }
})()

function renderFreshest(items) {
  const slot = document.getElementById('freshest-list')
  if (!slot || items.length === 0) return
  const top = items.slice(0, 3)
  slot.innerHTML = top.map((w) => `
    <button class="freshest-card" type="button" data-id="${w.namespaced_id}">
      <span class="freshest-id">${w.namespaced_id}</span>
      <span class="freshest-meta">${w.language ?? ''} · fresh</span>
    </button>
  `).join('')
  slot.parentElement.hidden = false
  for (const w of top) lastResults.set(w.namespaced_id, w)
  slot.addEventListener('click', (e) => {
    const btn = e.target.closest('.freshest-card')
    if (!btn) return
    search.dispatchEvent(new CustomEvent('widget-selected', {
      detail: { id: btn.dataset.id, source: btn },
    }))
  })
}

initScrollReveal()
attachSpotlightAll('[data-spotlight]', { unit: 'px' })
markReady()
