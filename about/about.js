import { applyTokens } from '../cg/frontend-design-tokens-javascript/src/design_tokens.js'
import { applyMetaTags } from '../cg/frontend-meta-tags-javascript/src/meta_tags.js'
import { defineSiteNav } from '../cg/frontend-nav-bar-javascript/src/nav_bar.js'
import { defineSiteFooter } from '../cg/frontend-footer-javascript/src/footer.js'
import { defineCodeBlock } from '../cg/frontend-code-block-javascript/src/code_block.js'
import { initScrollReveal, injectRevealStyles } from '../cg/frontend-scroll-reveal-javascript/src/scroll_reveal.js'

applyTokens({
  overrides: {
    color: { accent: '#FFC300', 'accent-strong': '#FF9500' },
  },
})

injectRevealStyles()

applyMetaTags({
  title: 'About Cartograph: code worth keeping',
  description: 'Why Cartograph exists: the pattern of reusable code that never escapes its origin repo, and what to do about it.',
  url: 'https://benteigland11.github.io/cartograph-showcase/about/',
  image: 'https://benteigland11.github.io/cartograph-showcase/og.png',
  themeColor: '#0a0b10',
  favicon: '../favicon.svg',
})

defineSiteNav('site-nav')
defineSiteFooter('site-footer')
defineCodeBlock('code-block')

initScrollReveal()
