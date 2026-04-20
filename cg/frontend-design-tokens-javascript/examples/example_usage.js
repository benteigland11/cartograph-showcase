import './_setup_dom.js'
import { applyTokens, tokensToCss, defaultTokens } from '../src/design_tokens.js'

const tokens = applyTokens({
  overrides: {
    color: { accent: '#ff7eb6' },
    radius: { md: '10px' },
  },
})

console.log('merged accent:', tokens.color.accent)
console.log('default bg preserved:', tokens.color.bg === defaultTokens.color.bg)
console.log('style tag injected:', !!document.getElementById('design-tokens'))
console.log('css preview:', tokensToCss({ color: { fg: '#fff' } }))
