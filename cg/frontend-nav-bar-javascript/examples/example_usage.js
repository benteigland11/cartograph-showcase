import './_setup_dom.js'
import { defineSiteNav } from '../src/nav_bar.js'

defineSiteNav('site-nav')

const nav = document.createElement('site-nav')
nav.innerHTML = `
  <span slot="brand">Atlas</span>
  <span slot="links">
    <a href="#features">Features</a>
    <a href="#docs">Docs</a>
    <a href="#repo">Repo</a>
  </span>
`
document.body.appendChild(nav)

console.log('rendered nav:', !!nav.shadowRoot.querySelector('nav'))
console.log('brand slot present:', !!nav.shadowRoot.querySelector('slot[name="brand"]'))
nav.toggleOpen()
console.log('after toggleOpen, open attr:', nav.hasAttribute('open'))
