// Template & theme registry for the /templates gallery.
//
// "Templates" are structurally distinct doc layouts (unique navigation,
// content measure, chrome). "Themes" are color/typography variations that
// sit on top of the default warm Dewey layout.

export type TemplateCategory = 'template' | 'theme'

export interface TemplateMeta {
  name: string
  displayName: string
  description: string
  category: TemplateCategory
  /** Short structural badges shown on the gallery card. */
  badges: string[]
  /** Accent color used for the theme swatch fallback. */
  primaryColor: string
  bgColor: string
  darkBgColor: string
}

export const templates: TemplateMeta[] = [
  // ─── Templates (structurally unique layouts) ───────────────────────
  {
    name: 'hudson',
    displayName: 'Hudson',
    description: 'Emerald accent with monospace headings, header bar + sidebar + TOC.',
    category: 'template',
    badges: ['Header bar', 'Sidebar + TOC', 'Geist Mono'],
    primaryColor: '#059669',
    bgColor: '#fafafa',
    darkBgColor: '#0a0a0a',
  },
  {
    name: 'rail',
    displayName: 'Rail',
    description: 'Icon-only left rail with a wide, focused content column.',
    category: 'template',
    badges: ['Icon rail', 'Wide', 'No TOC sidebar'],
    primaryColor: '#6366f1',
    bgColor: '#fbfbfd',
    darkBgColor: '#0b0b0f',
  },
  {
    name: 'centered',
    displayName: 'Centered',
    description: 'No sidebar. A single narrow measure with a floating TOC.',
    category: 'template',
    badges: ['No sidebar', 'Narrow', 'Floating TOC'],
    primaryColor: '#0d9488',
    bgColor: '#fcfbf8',
    darkBgColor: '#0d0f0e',
  },
  {
    name: 'command',
    displayName: 'Command',
    description: 'Command-bar-first navigation with a keyboard-forward palette.',
    category: 'template',
    badges: ['Command bar', 'Minimal chrome', 'Palette'],
    primaryColor: '#e11d48',
    bgColor: '#ffffff',
    darkBgColor: '#0a0a0c',
  },
]

export function getTemplate(name: string): TemplateMeta | undefined {
  return templates.find((t) => t.name === name)
}

export const templateItems = templates.filter((t) => t.category === 'template')
export const themeItems = templates.filter((t) => t.category === 'theme')

export interface TocEntry {
  id: string
  text: string
  depth: 2 | 3
}

/** Props every template preview component receives. */
export interface TemplatePreviewProps {
  /** Markdown already rendered to HTML by the Shiki pipeline. */
  contentHtml: string
  title: string
  description: string
  toc: TocEntry[]
}
