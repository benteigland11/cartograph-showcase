import './_setup_dom.js'
import { defineStackLayout } from '../src/stack_layout.js'

defineStackLayout('stack-layout')

const stack = document.createElement('stack-layout')
stack.style.setProperty('--stack-gap', '0.5rem')
stack.append(
  Object.assign(document.createElement('div'), { textContent: 'one' }),
  Object.assign(document.createElement('div'), { textContent: 'two' }),
  Object.assign(document.createElement('div'), { textContent: 'three' }),
)
document.body.appendChild(stack)

console.log('children:', stack.children.length)
console.log('styles injected:', !!document.getElementById('stack-layout-styles'))
