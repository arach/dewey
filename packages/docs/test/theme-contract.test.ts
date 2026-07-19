import { describe, expect, test } from 'bun:test'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PUBLISHED_CSS_THEMES } from '../src/themes'
import { deweyPreset } from '../src/tailwind/preset'
import { THEME_TOKENS } from '../src/cli/templates/astro'

/**
 * Semantic-token contract + WCAG AA regression guard for the 12 color presets.
 *
 * Every preset must resolve the full token contract in light AND dark (either
 * itself or via the tokens.css floor), and the pairs that base.css actually
 * renders as text/interactive UI must clear WCAG AA. Colors are resolved from
 * hex / rgb / hsl / oklch to linear-light sRGB using the WCAG luminance formula.
 */

const cssDir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/css')

// ---- color resolution (hex / rgb / hsl / oklch -> linear-light sRGB) ----
type RGB = { r: number; g: number; b: number }
const toLin = (c: number) => (c / 255 <= 0.03928 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4)
const toSrgb = (c: number) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

function hslLin(h: number, s: number, l: number): RGB {
  s /= 100; l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  return { r: toLin(f(0) * 255), g: toLin(f(8) * 255), b: toLin(f(4) * 255) }
}
function oklchLin(L: number, C: number, H: number): RGB {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return {
    r: clamp01(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: clamp01(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: clamp01(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  }
}
function resolve_(v: string, backdrop?: string): RGB | null {
  const t = v.trim().replace(/;$/, '')
  if (/transparent|color-mix|var\(/i.test(t)) return null
  let m: RegExpMatchArray | null
  if ((m = t.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i))) {
    let h = m[1]
    if (h.length === 3) h = h.split('').map(c => c + c).join('')
    return { r: toLin(parseInt(h.slice(0, 2), 16)), g: toLin(parseInt(h.slice(2, 4), 16)), b: toLin(parseInt(h.slice(4, 6), 16)) }
  }
  if ((m = t.match(/^rgba?\(([^)]+)\)/i))) {
    const p = m[1].split(/[,/]/).map(x => x.trim())
    if (p.length >= 4 && parseFloat(p[3]) < 1) {
      if (!backdrop) return null
      const under = resolve_(backdrop)
      if (!under) return null
      const alpha = parseFloat(p[3])
      return {
        r: toLin(+p[0] * alpha + toSrgb(under.r) * (1 - alpha)),
        g: toLin(+p[1] * alpha + toSrgb(under.g) * (1 - alpha)),
        b: toLin(+p[2] * alpha + toSrgb(under.b) * (1 - alpha)),
      }
    }
    return { r: toLin(+p[0]), g: toLin(+p[1]), b: toLin(+p[2]) }
  }
  if ((m = t.match(/^hsla?\(([^)]+)\)/i))) {
    const p = m[1].split(/[,/]/).map(x => x.trim())
    if (p.length >= 4 && parseFloat(p[3]) < 1) return null
    return hslLin(parseFloat(p[0]), parseFloat(p[1]), parseFloat(p[2]))
  }
  if ((m = t.match(/^oklch\(([^)]+)\)/i))) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean)
    return oklchLin(p[0].endsWith('%') ? parseFloat(p[0]) / 100 : parseFloat(p[0]), parseFloat(p[1]), p[2] ? parseFloat(p[2]) : 0)
  }
  return null
}
const lum = (c: RGB) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
function contrast(fg: string, bg: string, backdrop?: string): number | null {
  const a = resolve_(fg, backdrop), b = resolve_(bg, backdrop)
  if (!a || !b) return null
  const la = lum(a), lb = lum(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// ---- extract custom properties from a selector block ----
function block(css: string, re: RegExp): Record<string, string> {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const m = stripped.match(re)
  if (!m) return {}
  const out: Record<string, string> = {}
  for (const decl of m[1].split(';')) {
    const i = decl.indexOf(':')
    if (i < 0) continue
    const name = decl.slice(0, i).trim()
    if (name.startsWith('--dw-')) out[name.replace('--dw-', '')] = decl.slice(i + 1).trim()
  }
  return out
}

const tokensCss = readFileSync(`${cssDir}/tokens.css`, 'utf8')
const floorLight = block(tokensCss, /:root\s*\{([\s\S]*?)\n\}/)
const floorDark = block(tokensCss, /\.dark[^{]*\{([\s\S]*?)\n\}/)
const themeFiles = readdirSync(`${cssDir}/colors`).filter(f => f.endsWith('.css')).sort()

const CONTRACT = [
  'background', 'foreground', 'primary', 'primary-foreground', 'secondary', 'secondary-foreground',
  'muted', 'muted-foreground', 'accent', 'accent-foreground', 'border', 'ring',
  'info', 'info-foreground', 'warning', 'warning-foreground', 'error', 'error-foreground',
  'success', 'success-foreground', 'code-bg', 'code-border',
  'syntax-keyword', 'syntax-string', 'syntax-number', 'syntax-type', 'syntax-function',
  'syntax-punctuation', 'syntax-comment',
  'sidebar-bg', 'sidebar-border', 'sidebar-active', 'sidebar-active-bg', 'header-bg', 'header-border',
]

// pairs base.css renders as text (>=4.5) or focus UI (>=3.0)
const TEXT_PAIRS: [string, string][] = [
  ['foreground', 'background'], ['muted-foreground', 'background'], ['muted-foreground', 'sidebar-bg'],
  ['muted-foreground', 'secondary'], ['foreground', 'secondary'], ['foreground', 'code-bg'],
  ['primary', 'background'], ['primary-foreground', 'primary'], ['secondary-foreground', 'secondary'],
  ['accent-foreground', 'accent'], ['sidebar-active', 'sidebar-active-bg'],
  ['info', 'background'], ['warning', 'background'], ['error', 'background'], ['success', 'background'],
  ['info-foreground', 'info'], ['warning-foreground', 'warning'],
  ['error-foreground', 'error'], ['success-foreground', 'success'],
  ['syntax-keyword', 'code-bg'], ['syntax-string', 'code-bg'], ['syntax-number', 'code-bg'],
  ['syntax-type', 'code-bg'], ['syntax-function', 'code-bg'],
  ['syntax-punctuation', 'code-bg'], ['syntax-comment', 'code-bg'],
]

function effective(theme: Record<string, string>, dark: boolean, themeDark: Record<string, string>) {
  return dark ? { ...floorLight, ...theme, ...floorDark, ...themeDark } : { ...floorLight, ...theme }
}

describe('theme token contract', () => {
  test('tokens.css defines the semantic floor for light and dark', () => {
    for (const t of ['info', 'warning', 'error', 'success']) {
      expect(floorLight[t]).toBeTruthy()
      expect(floorLight[`${t}-foreground`]).toBeTruthy()
      expect(floorDark[t]).toBeTruthy()
      expect(floorDark[`${t}-foreground`]).toBeTruthy()
    }
  })

  test('all 12 presets resolve the full contract in light and dark', () => {
    expect(themeFiles.map(file => file.replace(/\.css$/, ''))).toEqual([...PUBLISHED_CSS_THEMES].sort())
    for (const file of themeFiles) {
      const css = readFileSync(`${cssDir}/colors/${file}`, 'utf8')
      const light = block(css, /:root\s*\{([\s\S]*?)\n\}/)
      const dark = block(css, /\.dark[^{]*\{([\s\S]*?)\n\}/)
      for (const mode of [false, true]) {
        const eff = effective(light, mode, dark)
        const missing = CONTRACT.filter(k => !(k in eff))
        expect(missing, `${file} (${mode ? 'dark' : 'light'}) missing: ${missing.join(', ')}`).toEqual([])
      }
    }
  })

  test('Tailwind maps typography and radius utilities to the runtime token contract', () => {
    const extended = deweyPreset().theme?.extend as {
      fontFamily: Record<string, string>
      borderRadius: Record<string, string>
    }
    expect(extended.fontFamily['dw-sans']).toContain('--dw-font-sans')
    expect(extended.fontFamily['dw-mono']).toContain('--dw-font-mono')
    expect(extended.borderRadius.dw).toContain('--dw-radius')
  })

  test('generated sites expose the same complete token contract in both modes', () => {
    expect(Object.keys(THEME_TOKENS).sort()).toEqual([...PUBLISHED_CSS_THEMES].sort())
    for (const [theme, css] of Object.entries(THEME_TOKENS)) {
      const light = block(css, /:root\s*\{([\s\S]*?)\n\s*\}/)
      const dark = block(css, /\[data-theme='dark'\]\s*\{([\s\S]*?)\n\s*\}/)
      for (const [mode, tokens] of [['light', light], ['dark', dark]] as const) {
        const missing = CONTRACT.filter(key => !(key in tokens))
        expect(missing, `${theme} generated ${mode} missing: ${missing.join(', ')}`).toEqual([])
      }
    }
  })

  test('presets declare only canonical contract or typography tokens', () => {
    const allowed = new Set([...CONTRACT, 'font-sans', 'font-serif', 'font-mono'])
    for (const file of themeFiles) {
      const css = readFileSync(`${cssDir}/colors/${file}`, 'utf8')
      const declarations = [...css.matchAll(/--dw-([a-z0-9-]+)\s*:/g)].map(match => match[1])
      const unknown = declarations.filter(name => !allowed.has(name))
      expect(unknown, `${file} declares unknown/dead tokens: ${unknown.join(', ')}`).toEqual([])
    }
  })

  test('every base component token reference resolves from the floor or a preset', () => {
    const base = readFileSync(`${cssDir}/base.css`, 'utf8')
    const references = [...base.matchAll(/var\(--dw-([a-z0-9-]+)/g)].map(match => match[1])
    const firstTheme = readFileSync(`${cssDir}/colors/${themeFiles[0]}`, 'utf8')
    const available = new Set([
      ...Object.keys(floorLight),
      ...Object.keys(floorDark),
      ...Object.keys(block(firstTheme, /:root\s*\{([\s\S]*?)\n\}/)),
      ...Object.keys(block(firstTheme, /\.dark[^{]*\{([\s\S]*?)\n\}/)),
    ])
    const missing = [...new Set(references)].filter(name => !available.has(name))
    expect(missing, `base.css references undeclared tokens: ${missing.join(', ')}`).toEqual([])
  })
})

describe('theme WCAG AA', () => {
  for (const file of themeFiles) {
    const css = readFileSync(`${cssDir}/colors/${file}`, 'utf8')
    const light = block(css, /:root\s*\{([\s\S]*?)\n\}/)
    const dark = block(css, /\.dark[^{]*\{([\s\S]*?)\n\}/)
    for (const isDark of [false, true]) {
      const mode = isDark ? 'dark' : 'light'
      test(`${file.replace('.css', '')} (${mode}) — text >=4.5, focus ring >=3`, () => {
        const eff = effective(light, isDark, dark)
        for (const [fg, bg] of TEXT_PAIRS) {
          const c = contrast(eff[fg], eff[bg], eff['background'])
          expect(c, `${fg}/${bg} must resolve to a testable color`).not.toBeNull()
          expect(c, `${fg}/${bg} = ${c?.toFixed(2)}`).toBeGreaterThanOrEqual(4.5)
        }
        const ring = contrast(eff['ring'], eff['background'])
        if (ring !== null) expect(ring, `ring/background = ${ring?.toFixed(2)}`).toBeGreaterThanOrEqual(3)
      })
    }
  }
})

describe('base.css accessibility rules', () => {
  const base = readFileSync(`${cssDir}/base.css`, 'utf8')
  test('defines visible keyboard focus', () => {
    expect(base).toContain(':focus-visible')
    expect(base).toMatch(/outline:\s*2px solid var\(--dw-ring\)/)
  })
  test('honors prefers-reduced-motion', () => {
    expect(base).toContain('prefers-reduced-motion: reduce')
  })

  test('theme font overrides use the runtime --dw-font-* namespace', () => {
    for (const file of ['warm.css', 'mono.css']) {
      const css = readFileSync(`${cssDir}/colors/${file}`, 'utf8')
      expect(css).toContain('--dw-font-sans:')
      expect(css).not.toContain('--font-dw-')
    }
  })
})

describe('public component theme ownership', () => {
  const componentDir = resolve(cssDir, '../components')
  const tokenizedComponents = [
    'AgentContext.tsx',
    'ApiTable.tsx',
    'Badge.tsx',
    'Callout.tsx',
    'Card.tsx',
    'CodeBlock.tsx',
    'CopyButtons.tsx',
    'DocsLayout.tsx',
    'FileTree.tsx',
    'HeadingLink.tsx',
    'MarkdownContent.tsx',
    'PromptSlideout.tsx',
    'Steps.tsx',
    'Tabs.tsx',
  ]

  test('tokenized components do not embed literal color palettes', () => {
    const colorLiteral = /#[0-9a-f]{3,8}\b|(?:rgb|hsl|oklch)a?\(|\b(?:white|black)\b|(?:bg|text|border)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)/i
    for (const file of tokenizedComponents) {
      const source = readFileSync(resolve(componentDir, file), 'utf8')
      expect(source, `${file} contains a hardcoded color`).not.toMatch(colorLiteral)
    }
  })

  test('base styles own each tokenized component surface', () => {
    const base = readFileSync(`${cssDir}/base.css`, 'utf8')
    for (const rootClass of [
      'dw-agent-context',
      'dw-api-table',
      'dw-badge',
      'dw-callout',
      'dw-card',
      'dw-code-block',
      'dw-copy-buttons',
      'dw-docs-layout',
      'dw-file-tree',
      'dw-heading-link',
      'dw-prose',
      'dw-prompt-slideout',
      'dw-steps',
      'dw-tabs',
    ]) {
      expect(base).toContain(`.${rootClass}`)
    }
  })
})
