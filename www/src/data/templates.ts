export interface TemplateMeta {
  name: string
  displayName: string
  description: string
  primaryColor: string
  bgColor: string
  darkBgColor: string
  fontUrls?: string[]
  category: 'template' | 'theme'
}

export interface TemplateLayout {
  header: 'full' | 'minimal' | 'hidden'
  sidebar: 'normal' | 'narrow' | 'hidden'
  toc: 'right' | 'hidden'
  contentWidth: 'narrow' | 'normal' | 'wide'
  density: 'compact' | 'normal' | 'spacious'
  prevNext: boolean
  breadcrumbs: boolean
}

export const templates: TemplateMeta[] = [
  // ─── Templates (structurally unique layouts) ───
  {
    name: 'hudson',
    displayName: 'Hudson',
    description: 'Dark-only with emerald accent and monospace headings',
    primaryColor: '#34d399',
    bgColor: '#0a0a0a',
    darkBgColor: '#0a0a0a',
    fontUrls: [
      'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap',
    ],
    category: 'template',
  },
  {
    name: 'topnav',
    displayName: 'Top Nav',
    description: 'Horizontal nav bar with full-width content',
    primaryColor: '#0891b2',
    bgColor: '#ffffff',
    darkBgColor: '#0c1222',
    fontUrls: [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    ],
    category: 'template',
  },
  {
    name: 'splitpane',
    displayName: 'Split Pane',
    description: 'Stripe-style prose + code side-by-side',
    primaryColor: '#7c5cfc',
    bgColor: '#f9f8f6',
    darkBgColor: '#252533',
    fontUrls: [
      'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap',
    ],
    category: 'template',
  },
  // ─── Themes (color & typography variations) ───
  {
    name: 'neutral',
    displayName: 'Neutral',
    description: 'Warm and elegant with orange accent',
    primaryColor: '#ea580c',
    bgColor: '#fffcf9',
    darkBgColor: '#0f172a',
    category: 'theme',
  },
  {
    name: 'ocean',
    displayName: 'Ocean',
    description: 'Cool, professional blue',
    primaryColor: 'hsl(210, 100%, 50%)',
    bgColor: 'hsl(210, 20%, 98%)',
    darkBgColor: 'hsl(215, 30%, 8%)',
    category: 'theme',
  },
  {
    name: 'emerald',
    displayName: 'Emerald',
    description: 'Fresh, natural green accents',
    primaryColor: 'hsl(158, 64%, 42%)',
    bgColor: 'hsl(150, 10%, 98%)',
    darkBgColor: 'hsl(155, 25%, 7%)',
    category: 'theme',
  },
  {
    name: 'purple',
    displayName: 'Purple',
    description: 'Elegant violet tones',
    primaryColor: 'hsl(262, 83%, 58%)',
    bgColor: 'hsl(270, 10%, 98%)',
    darkBgColor: 'hsl(265, 25%, 8%)',
    category: 'theme',
  },
  {
    name: 'dusk',
    displayName: 'Dusk',
    description: 'Warm evening with amber accents',
    primaryColor: 'hsl(24, 95%, 53%)',
    bgColor: 'hsl(30, 20%, 98%)',
    darkBgColor: 'hsl(25, 20%, 7%)',
    category: 'theme',
  },
  {
    name: 'rose',
    displayName: 'Rose',
    description: 'Soft pink for a friendly feel',
    primaryColor: 'hsl(346, 77%, 56%)',
    bgColor: 'hsl(350, 15%, 98%)',
    darkBgColor: 'hsl(345, 20%, 7%)',
    category: 'theme',
  },
  {
    name: 'github',
    displayName: 'GitHub',
    description: 'Clean and professional, GitHub-inspired',
    primaryColor: 'hsl(212, 92%, 45%)',
    bgColor: 'hsl(0, 0%, 100%)',
    darkBgColor: 'hsl(215, 21%, 11%)',
    category: 'theme',
  },
  {
    name: 'warm',
    displayName: 'Warm',
    description: 'Cream and terracotta, Arc-inspired',
    primaryColor: '#f07c4f',
    bgColor: '#f7f3ec',
    darkBgColor: '#16181c',
    fontUrls: [
      'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@300..700&display=swap',
    ],
    category: 'theme',
  },
  {
    name: 'midnight',
    displayName: 'Midnight',
    description: 'Deep navy with electric blue, glass-morphism',
    primaryColor: '#3b82f6',
    bgColor: '#f8fafc',
    darkBgColor: '#0c0e14',
    category: 'theme',
  },
  {
    name: 'mono',
    displayName: 'Mono',
    description: 'Ultra-clean monochrome, Vercel-inspired',
    primaryColor: '#0070f3',
    bgColor: '#ffffff',
    darkBgColor: '#000000',
    fontUrls: [
      'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap',
    ],
    category: 'theme',
  },
]

// ─── Layout definitions per template ─────────────────────────────────

export const templateLayouts: Record<string, TemplateLayout> = {
  neutral: {
    header: 'full',
    sidebar: 'normal',
    toc: 'right',
    contentWidth: 'normal',
    density: 'normal',
    prevNext: true,
    breadcrumbs: true,
  },
  ocean: {
    header: 'full',
    sidebar: 'normal',
    toc: 'right',
    contentWidth: 'normal',
    density: 'normal',
    prevNext: true,
    breadcrumbs: true,
  },
  emerald: {
    header: 'full',
    sidebar: 'narrow',
    toc: 'right',
    contentWidth: 'normal',
    density: 'spacious',
    prevNext: true,
    breadcrumbs: true,
  },
  purple: {
    header: 'minimal',
    sidebar: 'normal',
    toc: 'hidden',
    contentWidth: 'narrow',
    density: 'spacious',
    prevNext: true,
    breadcrumbs: false,
  },
  dusk: {
    header: 'full',
    sidebar: 'normal',
    toc: 'right',
    contentWidth: 'normal',
    density: 'compact',
    prevNext: true,
    breadcrumbs: true,
  },
  rose: {
    header: 'minimal',
    sidebar: 'hidden',
    toc: 'hidden',
    contentWidth: 'narrow',
    density: 'spacious',
    prevNext: false,
    breadcrumbs: false,
  },
  github: {
    header: 'full',
    sidebar: 'normal',
    toc: 'right',
    contentWidth: 'wide',
    density: 'normal',
    prevNext: true,
    breadcrumbs: true,
  },
  warm: {
    header: 'full',
    sidebar: 'narrow',
    toc: 'hidden',
    contentWidth: 'normal',
    density: 'normal',
    prevNext: true,
    breadcrumbs: true,
  },
  midnight: {
    header: 'full',
    sidebar: 'normal',
    toc: 'right',
    contentWidth: 'normal',
    density: 'compact',
    prevNext: true,
    breadcrumbs: true,
  },
  mono: {
    header: 'minimal',
    sidebar: 'narrow',
    toc: 'right',
    contentWidth: 'wide',
    density: 'compact',
    prevNext: true,
    breadcrumbs: true,
  },
  hudson: {
    header: 'full',
    sidebar: 'normal',
    toc: 'right',
    contentWidth: 'normal',
    density: 'normal',
    prevNext: true,
    breadcrumbs: true,
  },
  topnav: {
    header: 'full',
    sidebar: 'hidden',
    toc: 'right',
    contentWidth: 'normal',
    density: 'normal',
    prevNext: true,
    breadcrumbs: true,
  },
  splitpane: {
    header: 'hidden',
    sidebar: 'narrow',
    toc: 'hidden',
    contentWidth: 'wide',
    density: 'normal',
    prevNext: false,
    breadcrumbs: false,
  },
}

// ─── Convert layout config → DocsApp props + CSS overrides ──────────

const WIDTH_MAP: Record<TemplateLayout['contentWidth'], string> = {
  narrow: '65ch',
  normal: '80ch',
  wide: '100ch',
}

const SIDEBAR_WIDTH_MAP: Record<TemplateLayout['sidebar'], string> = {
  normal: '280px',
  narrow: '220px',
  hidden: '0',
}

const DENSITY_TOKENS: Record<TemplateLayout['density'], Record<string, string>> = {
  compact: {
    '--dw-content-padding-y': '1.25rem',
    '--dw-content-padding-x': '2rem',
    '--dw-content-top-offset': '1.5rem',
    '--dw-prose-line-height': '1.6',
    '--dw-prose-paragraph-spacing': '0.875rem',
    '--dw-heading-margin-top': '1.75rem',
  },
  normal: {},
  spacious: {
    '--dw-content-padding-y': '3rem',
    '--dw-content-padding-x': '4rem',
    '--dw-content-top-offset': '3.5rem',
    '--dw-prose-line-height': '1.9',
    '--dw-prose-paragraph-spacing': '1.5rem',
    '--dw-heading-margin-top': '3rem',
  },
}

export interface LayoutConfigResult {
  /** Props for DocsAppConfig.layout */
  layoutConfig: {
    sidebar: boolean
    toc: boolean
    header: boolean | 'minimal'
    prevNext: boolean
    breadcrumbs: boolean
  }
  /** CSS :root overrides string to inject */
  cssOverrides: string
}

export function templateLayoutToConfig(templateName: string): LayoutConfigResult {
  const layout = templateLayouts[templateName]

  // Fallback to neutral-like defaults
  if (!layout) {
    return {
      layoutConfig: {
        sidebar: true,
        toc: true,
        header: true,
        prevNext: true,
        breadcrumbs: true,
      },
      cssOverrides: '',
    }
  }

  // Build layout config for DocsApp
  const layoutConfig: LayoutConfigResult['layoutConfig'] = {
    sidebar: layout.sidebar !== 'hidden',
    toc: layout.toc !== 'hidden',
    header: layout.header === 'hidden' ? false : layout.header === 'minimal' ? 'minimal' : true,
    prevNext: layout.prevNext,
    breadcrumbs: layout.breadcrumbs,
  }

  // Build CSS overrides
  const vars: Record<string, string> = {}

  // Content width
  if (layout.contentWidth !== 'normal') {
    vars['--dw-content-max-width'] = WIDTH_MAP[layout.contentWidth]
  }

  // Sidebar width
  if (layout.sidebar === 'narrow') {
    vars['--dw-sidebar-width'] = SIDEBAR_WIDTH_MAP.narrow
  }

  // Density tokens
  const densityVars = DENSITY_TOKENS[layout.density]
  Object.assign(vars, densityVars)

  // Build CSS string
  const entries = Object.entries(vars)
  const cssOverrides = entries.length > 0
    ? `:root {\n${entries.map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`
    : ''

  return { layoutConfig, cssOverrides }
}

// ─── Layout badge labels for the gallery ────────────────────────────

export function getLayoutBadges(templateName: string): string[] {
  const layout = templateLayouts[templateName]
  if (!layout) return []

  const badges: string[] = []

  if (layout.header === 'minimal') badges.push('Minimal header')
  if (layout.header === 'hidden') badges.push('No header')
  if (layout.sidebar === 'hidden') badges.push('No sidebar')
  if (layout.sidebar === 'narrow') badges.push('Narrow sidebar')
  if (layout.toc === 'hidden') badges.push('No TOC')
  if (layout.contentWidth === 'narrow') badges.push('Narrow')
  if (layout.contentWidth === 'wide') badges.push('Wide')
  if (layout.density === 'compact') badges.push('Compact')
  if (layout.density === 'spacious') badges.push('Spacious')
  if (!layout.prevNext) badges.push('No prev/next')

  return badges
}
