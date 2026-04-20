import './_setup_dom.js'
import { defineHeroSection } from '../src/hero_section.js'

defineHeroSection('hero-section')

const hero = document.createElement('hero-section')
hero.setAttribute('layout', 'split')
hero.innerHTML = `
  <span slot="eyebrow">v1.0 — out now</span>
  <span slot="headline">A bold headline.</span>
  <span slot="subhead">A clear subhead that explains the offer in one breath.</span>
  <a slot="primary" href="#">Get started</a>
  <a slot="secondary" href="#">Learn more</a>
  <div slot="visual">visual here</div>
`
document.body.appendChild(hero)

console.log('rendered headline:', !!hero.shadowRoot.querySelector('h1'))
console.log('layout split applied:', hero.getAttribute('layout'))
