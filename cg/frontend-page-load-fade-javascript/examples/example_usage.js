import './_setup_dom.js'
import { buildLoadFadeCss, injectLoadFadeStyles, markReady } from '../src/page_load_fade.js'

console.log('css preview length:', buildLoadFadeCss({ bg: '#101418', durationMs: 200 }).length)

injectLoadFadeStyles({ bg: '#0a0b10' })
console.log('style injected:', !!document.getElementById('page-load-fade-styles'))

markReady()
console.log('body has is-ready class:', document.body.classList.contains('is-ready'))
