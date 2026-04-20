import './_setup_dom.js'
import { defineCodeBlock, highlightShell } from '../src/code_block.js'

defineCodeBlock('code-block')

const block = document.createElement('code-block')
block.setAttribute('lang', 'shell')
block.setAttribute('code', '$ install thing --flag value\n# a comment')
document.body.appendChild(block)

console.log('rendered code element:', !!block.shadowRoot.querySelector('code'))
console.log('highlighted html sample:', highlightShell('$ ls --color'))
