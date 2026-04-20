import './_setup_dom.js'
import { defineSiteFooter } from '../src/footer.js'

defineSiteFooter('site-footer')

const footer = document.createElement('site-footer')
footer.innerHTML = `
  <div slot="brand">Atlas</div>
  <div slot="columns">
    <div><strong>Product</strong><br><a href="#">Features</a><br><a href="#">Docs</a></div>
    <div><strong>Community</strong><br><a href="#">GitHub</a><br><a href="#">Discord</a></div>
  </div>
  <span slot="legal">MIT licensed.</span>
  <span slot="attribution">Built with care.</span>
`
document.body.appendChild(footer)

console.log('rendered:', !!footer.shadowRoot.querySelector('footer'))
console.log('slots:', footer.shadowRoot.querySelectorAll('slot').length)
