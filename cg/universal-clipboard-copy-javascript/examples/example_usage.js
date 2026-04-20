import './_setup_dom.js'
import { copyToClipboard } from '../src/clipboard_copy.js'

const ok = await copyToClipboard('hello world')
console.log('copied via clipboard API:', ok)
