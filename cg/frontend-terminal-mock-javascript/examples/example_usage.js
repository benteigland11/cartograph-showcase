import './_setup_dom.js'
import { defineTerminalMock } from '../src/terminal_mock.js'

defineTerminalMock('terminal-mock')

const term = document.createElement('terminal-mock')
term.setAttribute('speed', '1')
term.lines = [
  { prompt: '$ ', text: 'install thing --flag value' },
  { output: 'installed.' },
]
document.body.appendChild(term)

await new Promise((resolve) => {
  term.addEventListener('terminal-complete', resolve)
  term.play()
})

console.log('rendered lines:', term.shadowRoot.querySelectorAll('.line').length)
console.log('cursor present:', !!term.shadowRoot.querySelector('.cursor'))
