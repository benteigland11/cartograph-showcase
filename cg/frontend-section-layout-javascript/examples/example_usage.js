import './_setup_dom.js'
import { defineSectionLayout } from '../src/section_layout.js'

defineSectionLayout('section-layout')

const sec = document.createElement('section-layout')
sec.style.setProperty('--section-max', '40rem')
sec.innerHTML = '<h2>Bounded section</h2><p>Centered with consistent padding.</p>'
document.body.appendChild(sec)

console.log('children:', sec.children.length)
console.log('styles injected:', !!document.getElementById('section-layout-styles'))
