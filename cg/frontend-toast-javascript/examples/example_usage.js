import './_setup_dom.js'
import { showToast, clearToasts } from '../src/toast.js'

const a = showToast('saved')
const b = showToast('something broke', { variant: 'error' })
console.log('toast count:', document.querySelectorAll('.toast').length)
a.dismiss()
b.dismiss()
clearToasts()
console.log('after clear:', document.querySelectorAll('.toast').length)
