import './_setup_dom.js'
import { applyMetaTags } from '../src/meta_tags.js'

const SCHEME = 'http' + 's:' + '//'
const SITE = SCHEME + 'example.com/'

applyMetaTags({
  title: 'Example Site — built with care',
  description: 'A demo of programmatic meta tag injection.',
  url: SITE,
  image: SITE + 'og.png',
  siteName: 'Example',
  themeColor: '#0a0b10',
  favicon: '/favicon.svg',
  twitterSite: '@example',
})

console.log('title:', document.title)
console.log('og:title:', document.head.querySelector('meta[property="og:title"]').getAttribute('content'))
console.log('canonical:', document.head.querySelector('link[rel="canonical"]').getAttribute('href'))
console.log('twitter:card:', document.head.querySelector('meta[name="twitter:card"]').getAttribute('content'))
