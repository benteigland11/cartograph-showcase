const ATTR_MAP = {
  description: { tag: 'meta', selector: 'meta[name="description"]', attrs: { name: 'description' }, content: true },
  canonical: { tag: 'link', selector: 'link[rel="canonical"]', attrs: { rel: 'canonical' }, href: true },
  themeColor: { tag: 'meta', selector: 'meta[name="theme-color"]', attrs: { name: 'theme-color' }, content: true },
  favicon: { tag: 'link', selector: 'link[rel="icon"]', attrs: { rel: 'icon' }, href: true },

  ogTitle: { tag: 'meta', selector: 'meta[property="og:title"]', attrs: { property: 'og:title' }, content: true },
  ogDescription: { tag: 'meta', selector: 'meta[property="og:description"]', attrs: { property: 'og:description' }, content: true },
  ogUrl: { tag: 'meta', selector: 'meta[property="og:url"]', attrs: { property: 'og:url' }, content: true },
  ogImage: { tag: 'meta', selector: 'meta[property="og:image"]', attrs: { property: 'og:image' }, content: true },
  ogType: { tag: 'meta', selector: 'meta[property="og:type"]', attrs: { property: 'og:type' }, content: true },
  ogSiteName: { tag: 'meta', selector: 'meta[property="og:site_name"]', attrs: { property: 'og:site_name' }, content: true },
  ogLocale: { tag: 'meta', selector: 'meta[property="og:locale"]', attrs: { property: 'og:locale' }, content: true },

  twitterCard: { tag: 'meta', selector: 'meta[name="twitter:card"]', attrs: { name: 'twitter:card' }, content: true },
  twitterTitle: { tag: 'meta', selector: 'meta[name="twitter:title"]', attrs: { name: 'twitter:title' }, content: true },
  twitterDescription: { tag: 'meta', selector: 'meta[name="twitter:description"]', attrs: { name: 'twitter:description' }, content: true },
  twitterImage: { tag: 'meta', selector: 'meta[name="twitter:image"]', attrs: { name: 'twitter:image' }, content: true },
  twitterSite: { tag: 'meta', selector: 'meta[name="twitter:site"]', attrs: { name: 'twitter:site' }, content: true },
}

function setOrCreate(spec, value) {
  if (value == null) return
  let el = document.head.querySelector(spec.selector)
  if (!el) {
    el = document.createElement(spec.tag)
    for (const [k, v] of Object.entries(spec.attrs)) el.setAttribute(k, v)
    document.head.appendChild(el)
  }
  if (spec.content) el.setAttribute('content', value)
  if (spec.href) el.setAttribute('href', value)
}

export function applyMetaTags(config = {}) {
  const {
    title,
    description,
    url,
    image,
    type = 'website',
    siteName,
    locale = 'en_US',
    themeColor,
    favicon,
    twitterCard = 'summary_large_image',
    twitterSite,
  } = config

  if (title != null) document.title = title

  setOrCreate(ATTR_MAP.description, description)
  setOrCreate(ATTR_MAP.canonical, url)
  setOrCreate(ATTR_MAP.themeColor, themeColor)
  setOrCreate(ATTR_MAP.favicon, favicon)

  setOrCreate(ATTR_MAP.ogTitle, title)
  setOrCreate(ATTR_MAP.ogDescription, description)
  setOrCreate(ATTR_MAP.ogUrl, url)
  setOrCreate(ATTR_MAP.ogImage, image)
  setOrCreate(ATTR_MAP.ogType, type)
  setOrCreate(ATTR_MAP.ogSiteName, siteName)
  setOrCreate(ATTR_MAP.ogLocale, locale)

  setOrCreate(ATTR_MAP.twitterCard, image ? twitterCard : null)
  setOrCreate(ATTR_MAP.twitterTitle, title)
  setOrCreate(ATTR_MAP.twitterDescription, description)
  setOrCreate(ATTR_MAP.twitterImage, image)
  setOrCreate(ATTR_MAP.twitterSite, twitterSite)
}
