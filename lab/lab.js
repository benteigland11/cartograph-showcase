import { applyTokens } from '../cg/frontend-design-tokens-javascript/src/design_tokens.js'
import { applyMetaTags } from '../cg/frontend-meta-tags-javascript/src/meta_tags.js'
import { defineSiteNav } from '../cg/frontend-nav-bar-javascript/src/nav_bar.js'
import { defineTiltCard } from '../cg/frontend-tilt-card-javascript/src/tilt_card.js'
import { defineMarquee } from '../cg/frontend-marquee-javascript/src/marquee.js'
import { createNoiseField } from '../cg/frontend-noise-field-javascript/src/noise_field.js'
import { createGraphViewer } from '../cg/frontend-graph-viewer-javascript/src/graph_viewer.js'
import { defineSpringDrag } from '../cg/frontend-spring-drag-javascript/src/spring_drag.js'
import { defineMagneticButton } from '../cg/frontend-magnetic-button-javascript/src/magnetic_button.js'
import { defineTextScramble } from '../cg/frontend-text-scramble-javascript/src/text_scramble.js'
import { defineActivityHeatmap } from '../cg/frontend-activity-heatmap-javascript/src/activity_heatmap.js'

applyTokens({
  overrides: {
    color: {
      accent: '#FFC300',
      'accent-strong': '#FF9500',
    },
  },
})

applyMetaTags({
  title: 'Cartograph Lab: wait, that\'s a widget?',
  description: 'A wall of demos that look bespoke but are really just installable widgets.',
  url: 'https://benteigland11.github.io/cartograph-showcase/lab/',
  image: 'https://benteigland11.github.io/cartograph-showcase/og.png',
  themeColor: '#0a0b10',
  favicon: '../favicon.svg',
})

defineSiteNav('site-nav')
defineTiltCard('tilt-card')
defineMarquee('marquee-row')
defineSpringDrag('spring-drag')
defineMagneticButton('magnetic-button')
defineTextScramble('text-scramble')
defineActivityHeatmap('activity-heatmap')

const grid = document.getElementById('lab-grid')

function panel({ id, desc, stageHtml }) {
  const el = document.createElement('section')
  el.className = 'demo'
  el.innerHTML = `
    <div class="demo-stage">${stageHtml}</div>
    <div class="demo-caption">
      <span class="id">${id}</span>
      <span class="desc">${desc}</span>
    </div>
  `
  return el
}

const tiltPanel = panel({
  id: 'frontend-tilt-card-javascript',
  desc: 'Wrap anything for instant 3D parallax.',
  stageHtml: `
    <tilt-card max="14" scale="1.04" style="--tilt-glare-color: rgba(255, 234, 0, 0.22);">
      <div class="tilt-content">
        <span class="glyph">◆</span>
        <h3>Hover me</h3>
        <p>This card doesn't know about tilt. It's wrapped.</p>
      </div>
    </tilt-card>
  `,
})
grid.appendChild(tiltPanel)

const marqueeItems = [
  'frontend-design-tokens', 'frontend-meta-tags', 'frontend-nav-bar', 'frontend-footer',
  'frontend-hero-section', 'frontend-feature-grid', 'frontend-code-block', 'frontend-terminal-mock',
  'frontend-scroll-reveal', 'frontend-cursor-spotlight', 'frontend-toast', 'frontend-widget-search',
  'frontend-tilt-card', 'frontend-marquee', 'frontend-noise-field', 'frontend-graph-viewer',
  'universal-clipboard-copy', 'frontend-event-bus', 'frontend-web-component-base',
]
const marqueePanel = panel({
  id: 'frontend-marquee-javascript',
  desc: 'Infinite scrolling row of anything.',
  stageHtml: `
    <marquee-row speed="60" gap="1.25rem" pause-on-hover style="width: 100%;">
      ${marqueeItems.map((i) => `<span class="marquee-pill"><span class="dot"></span>${i}</span>`).join('')}
    </marquee-row>
  `,
})
grid.appendChild(marqueePanel)

const noisePanel = panel({
  id: 'frontend-noise-field-javascript',
  desc: 'Generative flow field. Pure JS.',
  stageHtml: `<canvas id="noise-canvas"></canvas>`,
})
grid.appendChild(noisePanel)

const graphPanel = panel({
  id: 'frontend-graph-viewer-javascript',
  desc: 'Drag the nodes. Hover to highlight neighbors.',
  stageHtml: `<canvas id="graph-canvas"></canvas>`,
})
grid.appendChild(graphPanel)

const springPanel = panel({
  id: 'frontend-spring-drag-javascript',
  desc: 'Drag the chip. It springs back.',
  stageHtml: `
    <spring-drag stiffness="0.16" damping="0.78">
      <div class="spring-chip">drag me</div>
    </spring-drag>
  `,
})
grid.appendChild(springPanel)

const magneticPanel = panel({
  id: 'frontend-magnetic-button-javascript',
  desc: 'Approach the button. It comes to you.',
  stageHtml: `
    <magnetic-button radius="160" strength="0.4">
      <a href="#" class="magnetic-cta" onclick="event.preventDefault()">Get started →</a>
    </magnetic-button>
  `,
})
grid.appendChild(magneticPanel)

const scramblePanel = panel({
  id: 'frontend-text-scramble-javascript',
  desc: 'Hover to re-decode the text.',
  stageHtml: `
    <div class="scramble-stage">
      <text-scramble id="scramble-target" autoplay speed="1.6" text="code worth keeping"></text-scramble>
    </div>
  `,
})
grid.appendChild(scramblePanel)

const heatmapPanel = panel({
  id: 'frontend-activity-heatmap-javascript',
  desc: 'Hover a cell. GitHub-grid energy.',
  stageHtml: `<div class="heatmap-stage"><activity-heatmap id="heatmap" weeks="22"></activity-heatmap></div>`,
})
grid.appendChild(heatmapPanel)

document.getElementById('composed-count').textContent = '10'

requestAnimationFrame(() => {
  const target = document.getElementById('scramble-target')
  if (!target) return
  const phrases = ['code worth keeping', 'write it once, iterate', 'every piece a widget', 'compose, do not duplicate']
  let i = 0
  target.parentElement.addEventListener('pointerenter', () => {
    i = (i + 1) % phrases.length
    target.play(phrases[i])
  })

  const heatmap = document.getElementById('heatmap')
  if (heatmap) {
    const today = new Date()
    const data = []
    for (let d = 0; d < 22 * 7; d++) {
      const day = new Date(today)
      day.setDate(today.getDate() - d)
      const seed = Math.sin((d + 1) * 12.9898) * 43758.5453
      const r = seed - Math.floor(seed)
      const r2 = (Math.sin((d + 7) * 78.233) * 43758.5453)
      const r3 = r2 - Math.floor(r2)
      if (r > 0.45) data.push({ date: day.toISOString().slice(0, 10), count: Math.ceil(r3 * 8) })
    }
    heatmap.data = data
  }
})

requestAnimationFrame(() => {
  const noiseCanvas = document.getElementById('noise-canvas')
  const noise = createNoiseField(noiseCanvas, {
    count: 180,
    colors: ['#FFEA00', '#FFC300', '#FF9500'],
    background: 'rgba(6, 7, 11, 0.06)',
    scale: 0.0045,
    speed: 1.1,
    alpha: 0.4,
  })
  noise.start()

  const graphCanvas = document.getElementById('graph-canvas')
  const widgets = [
    { id: 'tokens', label: 'design-tokens', color: '#FFEA00' },
    { id: 'meta', label: 'meta-tags', color: '#FFC300' },
    { id: 'nav', label: 'nav-bar', color: '#FFC300' },
    { id: 'footer', label: 'footer', color: '#FFC300' },
    { id: 'hero', label: 'hero-section', color: '#FFC300' },
    { id: 'grid', label: 'feature-grid', color: '#FFC300' },
    { id: 'code', label: 'code-block', color: '#FFC300' },
    { id: 'term', label: 'terminal-mock', color: '#FFC300' },
    { id: 'search', label: 'widget-search', color: '#FFC300' },
    { id: 'toast', label: 'toast', color: '#FFC300' },
    { id: 'tilt', label: 'tilt-card', color: '#FFC300' },
    { id: 'marq', label: 'marquee', color: '#FFC300' },
    { id: 'noise', label: 'noise-field', color: '#FFC300' },
    { id: 'graph', label: 'graph-viewer', color: '#FFC300' },
    { id: 'clip', label: 'clipboard-copy', color: '#FFEA00' },
    { id: 'bus', label: 'event-bus', color: '#FFC300' },
    { id: 'wcb', label: 'web-component-base', color: '#FF9500' },
  ]
  const edges = [
    { source: 'wcb', target: 'nav' }, { source: 'wcb', target: 'footer' },
    { source: 'wcb', target: 'hero' }, { source: 'wcb', target: 'grid' },
    { source: 'wcb', target: 'code' }, { source: 'wcb', target: 'term' },
    { source: 'wcb', target: 'search' }, { source: 'wcb', target: 'tilt' },
    { source: 'wcb', target: 'marq' },
    { source: 'tokens', target: 'nav' }, { source: 'tokens', target: 'footer' },
    { source: 'tokens', target: 'hero' }, { source: 'tokens', target: 'grid' },
    { source: 'tokens', target: 'code' },
    { source: 'code', target: 'clip' },
    { source: 'search', target: 'toast' },
    { source: 'bus', target: 'wcb' },
  ]
  const graph = createGraphViewer(graphCanvas, {
    nodes: widgets,
    edges,
    nodeColor: '#FFC300',
    background: '#0a0b10',
    showLabels: true,
    repulsion: 1200,
    springLength: 70,
    centerStrength: 0.008,
    initialSpread: 0.95,
    maxVelocity: 4,
    damping: 0.78,
  })
  graph.start()

  window.addEventListener('resize', () => { noise.resize(); graph.resize() })
  document.body.classList.add('is-ready')
})
