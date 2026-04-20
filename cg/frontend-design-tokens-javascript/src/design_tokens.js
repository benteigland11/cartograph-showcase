export const defaultTokens = {
  color: {
    bg: '#0a0b10',
    'bg-elevated': '#13151c',
    'bg-sunken': '#06070b',
    fg: '#f0f2f8',
    'fg-muted': '#8a90a0',
    'fg-subtle': '#5a6070',
    border: '#22252f',
    'border-strong': '#363a48',
    accent: '#7dd3fc',
    'accent-strong': '#38bdf8',
    'accent-soft': '#0c4a6e',
    danger: '#f87171',
    success: '#4ade80',
  },
  space: {
    '0': '0',
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '6': '1.5rem',
    '8': '2rem',
    '12': '3rem',
    '16': '4rem',
    '24': '6rem',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '20px',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.35)',
    lg: '0 12px 32px rgba(0,0,0,0.45)',
    glow: '0 0 0 1px rgba(125,211,252,0.2), 0 8px 24px rgba(125,211,252,0.15)',
  },
  font: {
    sans: '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  size: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.375rem',
    '2xl': '1.75rem',
    '3xl': '2.25rem',
    '4xl': '3rem',
    '5xl': '4rem',
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  leading: {
    tight: '1.15',
    snug: '1.35',
    normal: '1.55',
    relaxed: '1.7',
  },
  ease: {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  },
}

function deepMerge(base, override) {
  const out = { ...base }
  for (const key of Object.keys(override || {})) {
    const a = base[key]
    const b = override[key]
    if (a && typeof a === 'object' && !Array.isArray(a) && b && typeof b === 'object') {
      out[key] = deepMerge(a, b)
    } else {
      out[key] = b
    }
  }
  return out
}

export function tokensToCss(tokens, { prefix = '' } = {}) {
  const lines = []
  for (const group of Object.keys(tokens)) {
    for (const key of Object.keys(tokens[group])) {
      lines.push(`  --${prefix}${group}-${key}: ${tokens[group][key]};`)
    }
  }
  return `:root {\n${lines.join('\n')}\n}`
}

export function applyTokens({ overrides = {}, id = 'design-tokens', prefix = '' } = {}) {
  const tokens = deepMerge(defaultTokens, overrides)
  let style = document.getElementById(id)
  if (!style) {
    style = document.createElement('style')
    style.id = id
    document.head.appendChild(style)
  }
  style.textContent = tokensToCss(tokens, { prefix })
  return tokens
}
