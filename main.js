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
  title: 'Cartograph — code worth keeping',
  description: 'A widget library manager for code you actually want to reuse. Search, install, validate, version, share.',
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

const main = document.getElementById('top')

main.innerHTML = `
  <div class="hero-stage" data-spotlight>
  <hero-section layout="split">
    <span slot="eyebrow">Cartograph · v1.0</span>
    <span slot="headline">Code worth keeping. Install it once.</span>
    <span slot="subhead">A widget library manager for code you actually want to reuse. Search the catalog, install with one command, version on every change.</span>
    <a slot="primary" class="btn btn-primary" href="https://github.com/benteigland11/Cartograph">Get started →</a>
    <a slot="secondary" class="btn btn-secondary" href="#features">See features</a>
    <terminal-mock
      slot="visual"
      data-reveal
      style="--reveal-delay: 100ms"
      autoplay
      speed="28"
      lines='[
        {"prompt":"$ ","text":"cartograph search retry","delay":600},
        {"output":"  universal-retry-backoff-python    ★ 4.8  · exponential backoff with jitter"},
        {"output":"  universal-retry-policy-javascript ★ 4.6  · pluggable retry policies","delay":500},
        {"prompt":"$ ","text":"cartograph install universal-retry-backoff-python","delay":400},
        {"output":"✓ installed → cg/universal-retry-backoff-python  (v1.2.0)"}
      ]'
    ></terminal-mock>
  </hero-section>
  </div>

  <hr class="divider" />

  <section id="why" class="bounded">
    <p class="section-eyebrow" data-reveal>The problem</p>
    <h2 class="section-title" data-reveal style="--reveal-delay: 60ms">Same code, different repos.</h2>
    <p class="section-lede" data-reveal style="--reveal-delay: 120ms">You wrote that retry helper. Or the env loader. Or the timestamp parser. Three times this quarter, in three projects. Each copy drifts. Each copy hides the same bug. None know about the others.</p>

    <div class="comparison" data-reveal style="--reveal-delay: 180ms">
      <div class="comparison-side">
        <p class="comparison-label">Without</p>
        <code-block lang="shell" code="$ grep -r 'def retry' ~/projects
project-a/utils.py:    def retry(fn, n=3):
project-b/lib/net.py:  def retry_call(...):
project-c/helpers.py:  def with_backoff(...):
$ # three implementations. zero shared fixes."></code-block>
      </div>
      <div class="comparison-side">
        <p class="comparison-label">With Cartograph</p>
        <code-block lang="shell" code="$ cartograph search retry
  universal-retry-backoff-python  ★ 4.8  · 1.2k installs
$ cartograph install universal-retry-backoff-python
✓ installed → cg/universal-retry-backoff-python  (v1.2.0)"></code-block>
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
    <p class="section-lede" data-reveal style="--reveal-delay: 120ms">This input is hitting <code style="font-family: var(--font-mono); color: var(--color-accent)">api.cartograph.tools</code> in real time. Type a keyword. Click a result to copy its install command.</p>
    <widget-search data-reveal style="--reveal-delay: 180ms" id="live-search"></widget-search>
    <p class="search-hint" id="search-hint" data-reveal style="--reveal-delay: 240ms" hidden></p>
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
    <p class="section-lede" data-reveal style="--reveal-delay: 120ms">Every section above was assembled from the widgets below — installed, not written from scratch. Click through to install any of them.</p>
    <ul class="composed-list" data-reveal style="--reveal-delay: 180ms" id="composed-list"></ul>
  </section>
`

const grid = main.querySelector('feature-grid')
const features = [
  { icon: '⌕', title: 'Search', body: 'Find widgets by query, domain, or language. Filter the catalog before installing anything.' },
  { icon: '↓', title: 'Install', body: 'One command lands the widget in cg/, fully self-contained — code, tests, examples, metadata.' },
  { icon: '✓', title: 'Validate', body: 'Tests, contamination scan, coverage gate. A widget is either valid or it does not check in.' },
  { icon: '⇡', title: 'Version', body: 'Semver bumps via bump flag. Cartograph manages the version field — you never hand-edit it.' },
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
const searchHint = document.getElementById('search-hint')
search.fetcher = async (query, signal) => {
  const url = new URL('https://api.cartograph.tools/v1/widgets/search')
  url.searchParams.set('q', query)
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data.widgets ?? []
}
search.addEventListener('widget-selected', async (e) => {
  const id = e.detail.id
  const cmd = `cartograph install ${id}`
  try {
    await navigator.clipboard.writeText(cmd)
    searchHint.textContent = `Copied: ${cmd}`
  } catch {
    searchHint.textContent = `Run: ${cmd}`
  }
  searchHint.hidden = false
})

initScrollReveal()
attachSpotlightAll('[data-spotlight]', { unit: 'px' })
