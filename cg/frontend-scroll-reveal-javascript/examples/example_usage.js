import './_setup_dom.js'
import { initScrollReveal, injectRevealStyles } from '../src/scroll_reveal.js'

injectRevealStyles()

const a = document.createElement('section')
a.setAttribute('data-reveal', '')
document.body.appendChild(a)

const controller = initScrollReveal()
console.log('revealed class applied:', a.classList.contains('is-revealed'))
console.log('controller methods:', Object.keys(controller))
