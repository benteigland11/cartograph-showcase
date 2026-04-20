import { applyMetaTags } from '../src/meta_tags.js'

const SCHEME = 'http' + 's:' + '//'
const SITE = SCHEME + 'example.com/'
const URL = SCHEME + 'x.test/'
const IMG = URL + 'og.png'

describe('applyMetaTags', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.title = ''
  })

  test('sets document.title', () => {
    applyMetaTags({ title: 'My Site' })
    expect(document.title).toBe('My Site')
  })

  test('injects description meta tag', () => {
    applyMetaTags({ description: 'A great site' })
    const el = document.head.querySelector('meta[name="description"]')
    expect(el.getAttribute('content')).toBe('A great site')
  })

  test('injects canonical link', () => {
    applyMetaTags({ url: SITE })
    const el = document.head.querySelector('link[rel="canonical"]')
    expect(el.getAttribute('href')).toBe(SITE)
  })

  test('injects favicon link', () => {
    applyMetaTags({ favicon: '/favicon.svg' })
    const el = document.head.querySelector('link[rel="icon"]')
    expect(el.getAttribute('href')).toBe('/favicon.svg')
  })

  test('injects OG tags', () => {
    applyMetaTags({
      title: 'T', description: 'D', url: URL, image: IMG,
      siteName: 'X', type: 'article',
    })
    expect(document.head.querySelector('meta[property="og:title"]').getAttribute('content')).toBe('T')
    expect(document.head.querySelector('meta[property="og:description"]').getAttribute('content')).toBe('D')
    expect(document.head.querySelector('meta[property="og:url"]').getAttribute('content')).toBe(URL)
    expect(document.head.querySelector('meta[property="og:image"]').getAttribute('content')).toBe(IMG)
    expect(document.head.querySelector('meta[property="og:type"]').getAttribute('content')).toBe('article')
    expect(document.head.querySelector('meta[property="og:site_name"]').getAttribute('content')).toBe('X')
    expect(document.head.querySelector('meta[property="og:locale"]').getAttribute('content')).toBe('en_US')
  })

  test('skips twitter card when image is missing', () => {
    applyMetaTags({ title: 'T', description: 'D' })
    expect(document.head.querySelector('meta[name="twitter:card"]')).toBeFalsy()
  })

  test('injects twitter tags when image is provided', () => {
    applyMetaTags({ title: 'T', description: 'D', image: IMG, twitterSite: '@me' })
    expect(document.head.querySelector('meta[name="twitter:card"]').getAttribute('content')).toBe('summary_large_image')
    expect(document.head.querySelector('meta[name="twitter:image"]').getAttribute('content')).toBe(IMG)
    expect(document.head.querySelector('meta[name="twitter:site"]').getAttribute('content')).toBe('@me')
  })

  test('updates existing tags instead of duplicating', () => {
    applyMetaTags({ description: 'first' })
    applyMetaTags({ description: 'second' })
    const all = document.head.querySelectorAll('meta[name="description"]')
    expect(all.length).toBe(1)
    expect(all[0].getAttribute('content')).toBe('second')
  })

  test('skips fields that are not provided', () => {
    applyMetaTags({ title: 'T' })
    expect(document.head.querySelector('meta[name="description"]')).toBeFalsy()
    expect(document.head.querySelector('link[rel="canonical"]')).toBeFalsy()
  })

  test('honors custom theme color', () => {
    applyMetaTags({ themeColor: '#ff00ff' })
    expect(document.head.querySelector('meta[name="theme-color"]').getAttribute('content')).toBe('#ff00ff')
  })

  test('no-op when called with no config', () => {
    expect(() => applyMetaTags()).not.toThrow()
  })
})
