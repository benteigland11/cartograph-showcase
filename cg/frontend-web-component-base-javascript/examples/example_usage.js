import './_setup_dom.js'
import { WebComponentBase, defineComponent } from '../src/web_component_base.js'

class Greeting extends WebComponentBase {
  static template = `<p class="greet"><slot></slot></p><button id="wave">wave</button>`
  static styles = `.greet { font-weight: bold; }`

  connectedCallback() {
    this.$('#wave').addEventListener('click', () => this.emit('waved', { from: 'greeting' }))
  }
}

defineComponent('hello-greeting', Greeting)

const el = document.createElement('hello-greeting')
el.textContent = 'world'
document.body.appendChild(el)

console.log('rendered:', el.shadowRoot.querySelector('.greet').outerHTML)
console.log('button id:', el.$('#wave').id)

el.addEventListener('waved', (e) => console.log('event detail:', e.detail))
el.$('#wave').click()
