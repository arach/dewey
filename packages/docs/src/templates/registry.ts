// Canonical template + theme registry types and CLI resolution helpers.
// Gallery-specific preview metadata lives in www/src/lib/templates.ts.

export type TemplateId = 'hudson' | 'rail' | 'centered' | 'command'
export type ThemeId =
  | 'neutral'
  | 'ocean'
  | 'emerald'
  | 'purple'
  | 'dusk'
  | 'rose'
  | 'github'
  | 'warm'
  | 'midnight'
  | 'mono'

export const VALID_TEMPLATE_IDS = ['hudson', 'rail', 'centered', 'command'] as const
export const VALID_THEME_IDS = [
  'neutral',
  'ocean',
  'emerald',
  'purple',
  'dusk',
  'rose',
  'github',
  'warm',
  'midnight',
  'mono',
] as const

/** Legacy structural names — not in gallery or create help. */
export const DEPRECATED_TEMPLATE_ALIASES: Record<string, TemplateId | null> = {
  topnav: 'centered',
  splitpane: null,
}

export type HeaderSurface = 'bar' | 'minimal' | 'none'
export type NavSurface = 'sidebar' | 'rail' | 'topbar' | 'command' | 'none'
export type TocSurface = 'right' | 'floating' | 'inline' | 'none'
export type ContentMeasure = 'narrow' | 'normal' | 'wide' | 'split'
export type LayoutDensity = 'compact' | 'normal' | 'spacious'

export interface TemplateLayoutSpec {
  header: HeaderSurface
  nav: NavSurface
  toc: TocSurface
  measure: ContentMeasure
  density: LayoutDensity
  page: {
    breadcrumbs: boolean
    prevNext: boolean
    agentActions: boolean
  }
  cssVars?: Partial<Record<`--${string}`, string>>
}

export interface DocsAppLayoutConfig {
  sidebar: boolean
  toc: boolean
  header: boolean | 'minimal'
  prevNext: boolean
  breadcrumbs: boolean
}

export interface CreateThemeSpec {
  id: ThemeId
  label: string
  description: string
  cssImport: `@arach/dewey/css/colors/${ThemeId}.css`
  fontUrls?: readonly string[]
  swatch: { primary: string; background: string; darkBackground: string }
}

export interface CreateTemplateSpec {
  id: TemplateId
  label: string
  status: 'stable' | 'experimental'
  defaultTheme: ThemeId
  compatibleThemes: readonly ThemeId[] | 'all' | 'none'
}

export const CREATE_THEME_SPECS: Record<ThemeId, CreateThemeSpec> = {
  neutral: {
    id: 'neutral',
    label: 'Neutral',
    description: 'Warm and elegant with orange accent',
    cssImport: '@arach/dewey/css/colors/neutral.css',
    swatch: { primary: '#ea580c', background: '#fffcf9', darkBackground: '#0f172a' },
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    description: 'Cool, professional blue',
    cssImport: '@arach/dewey/css/colors/ocean.css',
    swatch: { primary: 'hsl(210, 100%, 50%)', background: 'hsl(210, 20%, 98%)', darkBackground: 'hsl(215, 30%, 8%)' },
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald',
    description: 'Fresh, natural green accents',
    cssImport: '@arach/dewey/css/colors/emerald.css',
    swatch: { primary: 'hsl(158, 64%, 42%)', background: 'hsl(150, 10%, 98%)', darkBackground: 'hsl(155, 25%, 7%)' },
  },
  purple: {
    id: 'purple',
    label: 'Purple',
    description: 'Elegant violet tones',
    cssImport: '@arach/dewey/css/colors/purple.css',
    swatch: { primary: 'hsl(262, 83%, 58%)', background: 'hsl(270, 10%, 98%)', darkBackground: 'hsl(265, 25%, 8%)' },
  },
  dusk: {
    id: 'dusk',
    label: 'Dusk',
    description: 'Warm evening with amber accents',
    cssImport: '@arach/dewey/css/colors/dusk.css',
    swatch: { primary: 'hsl(24, 95%, 53%)', background: 'hsl(30, 20%, 98%)', darkBackground: 'hsl(25, 20%, 7%)' },
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    description: 'Soft pink for a friendly feel',
    cssImport: '@arach/dewey/css/colors/rose.css',
    swatch: { primary: 'hsl(346, 77%, 56%)', background: 'hsl(350, 15%, 98%)', darkBackground: 'hsl(345, 20%, 7%)' },
  },
  github: {
    id: 'github',
    label: 'GitHub',
    description: 'Clean and professional, GitHub-inspired',
    cssImport: '@arach/dewey/css/colors/github.css',
    swatch: { primary: 'hsl(212, 92%, 45%)', background: '#ffffff', darkBackground: 'hsl(215, 21%, 11%)' },
  },
  warm: {
    id: 'warm',
    label: 'Warm',
    description: 'Cream and terracotta, Arc-inspired',
    cssImport: '@arach/dewey/css/colors/warm.css',
    fontUrls: [
      'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@300..700&display=swap',
    ],
    swatch: { primary: '#f07c4f', background: '#f7f3ec', darkBackground: '#16181c' },
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    description: 'Deep navy with electric blue',
    cssImport: '@arach/dewey/css/colors/midnight.css',
    swatch: { primary: '#3b82f6', background: '#f8fafc', darkBackground: '#0c0e14' },
  },
  mono: {
    id: 'mono',
    label: 'Mono',
    description: 'Ultra-clean monochrome, Vercel-inspired',
    cssImport: '@arach/dewey/css/colors/mono.css',
    fontUrls: [
      'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap',
    ],
    swatch: { primary: '#0070f3', background: '#ffffff', darkBackground: '#000000' },
  },
}

export const CREATE_TEMPLATE_SPECS: Record<TemplateId, CreateTemplateSpec> = {
  hudson: {
    id: 'hudson',
    label: 'Hudson',
    status: 'stable',
    defaultTheme: 'neutral',
    compatibleThemes: 'all',
  },
  rail: {
    id: 'rail',
    label: 'Rail',
    status: 'experimental',
    defaultTheme: 'neutral',
    compatibleThemes: 'none',
  },
  centered: {
    id: 'centered',
    label: 'Centered',
    status: 'experimental',
    defaultTheme: 'neutral',
    compatibleThemes: 'none',
  },
  command: {
    id: 'command',
    label: 'Command',
    status: 'experimental',
    defaultTheme: 'neutral',
    compatibleThemes: 'none',
  },
}

export const DEFAULT_DOCS_LAYOUT: TemplateLayoutSpec = {
  header: 'bar',
  nav: 'sidebar',
  toc: 'right',
  measure: 'normal',
  density: 'normal',
  page: { breadcrumbs: true, prevNext: true, agentActions: true },
}

const MEASURE_WIDTH: Record<ContentMeasure, string> = {
  narrow: '65ch',
  normal: '80ch',
  wide: '100ch',
  split: '100ch',
}

const DENSITY_VARS: Record<LayoutDensity, Partial<Record<`--${string}`, string>>> = {
  compact: {
    '--dw-content-padding-y': '1.25rem',
    '--dw-prose-line-height': '1.6',
  },
  normal: {},
  spacious: {
    '--dw-content-padding-y': '3rem',
    '--dw-prose-line-height': '1.9',
  },
}

export interface ResolvedCreateOptions {
  templateId: TemplateId
  themeId: ThemeId
  warnings: string[]
}

export function resolveCreateOptions(input?: {
  template?: string
  theme?: string
}): ResolvedCreateOptions {
  const warnings: string[] = []
  let templateId: TemplateId = 'hudson'
  let themeId: ThemeId = 'neutral'

  if (input?.template) {
    const alias = DEPRECATED_TEMPLATE_ALIASES[input.template]
    if (alias) {
      warnings.push(`"${input.template}" is deprecated; using template "${alias}".`)
      templateId = alias
    } else if (VALID_TEMPLATE_IDS.includes(input.template as TemplateId)) {
      templateId = input.template as TemplateId
    } else {
      warnings.push(`Unknown template "${input.template}"; using "hudson".`)
    }
  }

  if (input?.theme) {
    if (input.theme === 'hudson') {
      warnings.push('hudson is a structural template; use --template hudson --theme <color>. Using theme "neutral".')
      if (!input.template) templateId = 'hudson'
      themeId = 'neutral'
    } else if (VALID_THEME_IDS.includes(input.theme as ThemeId)) {
      themeId = input.theme as ThemeId
    } else {
      warnings.push(`Unknown theme "${input.theme}"; using "neutral".`)
    }
  }

  return { templateId, themeId, warnings }
}

/** @deprecated use resolveCreateOptions */
export function resolveTheme(theme?: string): ThemeId {
  return resolveCreateOptions({ theme }).themeId
}

export function toDocsAppLayout(layout: TemplateLayoutSpec): DocsAppLayoutConfig {
  return {
    sidebar: layout.nav === 'sidebar',
    toc: layout.toc !== 'none',
    header: layout.header === 'none' ? false : layout.header === 'minimal' ? 'minimal' : true,
    prevNext: layout.page.prevNext,
    breadcrumbs: layout.page.breadcrumbs,
  }
}

export function layoutBadges(layout: TemplateLayoutSpec, overrides?: string[]): string[] {
  if (overrides?.length) return overrides
  const badges: string[] = []
  if (layout.nav === 'rail') badges.push('Icon rail')
  if (layout.nav === 'command') badges.push('Command bar')
  if (layout.nav === 'none') badges.push('No sidebar')
  if (layout.toc === 'floating') badges.push('Floating TOC')
  if (layout.toc === 'none') badges.push('No TOC')
  if (layout.measure === 'narrow') badges.push('Narrow')
  if (layout.measure === 'wide') badges.push('Wide')
  if (layout.measure === 'split') badges.push('Split pane')
  if (layout.header === 'minimal') badges.push('Minimal header')
  if (layout.header === 'none') badges.push('No header')
  if (layout.density === 'compact') badges.push('Compact')
  if (layout.density === 'spacious') badges.push('Spacious')
  if (!layout.page.prevNext) badges.push('No prev/next')
  return badges
}

export function layoutCssOverrides(layout: TemplateLayoutSpec): string {
  const vars: Record<string, string> = {}
  if (layout.cssVars) {
    for (const [key, value] of Object.entries(layout.cssVars)) {
      if (value !== undefined) vars[key] = value
    }
  }
  if (layout.measure !== 'normal') vars['--dw-content-max-width'] = MEASURE_WIDTH[layout.measure]
  if (layout.nav === 'sidebar' && layout.measure === 'normal') {
    // narrow sidebar themes set this via layoutOverrides on theme entries
  }
  Object.assign(vars, DENSITY_VARS[layout.density])
  const entries = Object.entries(vars)
  if (entries.length === 0) return ''
  return `:root {\n${entries.map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`
}