// Template & theme gallery registry — Codex split model.
// CLI create specs live in @arach/dewey (packages/docs/src/templates/registry.ts).

import {
  CREATE_THEME_SPECS,
  layoutBadges,
  toDocsAppLayout,
  type DocsAppLayoutConfig,
  type TemplateId,
  type TemplateLayoutSpec,
  type ThemeId,
} from '@arach/dewey/registry'

export type { TemplateId, ThemeId, TemplateLayoutSpec, DocsAppLayoutConfig }

export type RegistryEntry = TemplateEntry | ThemeEntry

export interface RegistryBase<TKind extends 'template' | 'theme', TId extends string> {
  kind: TKind
  id: TId
  label: string
  description: string
  status?: 'stable' | 'experimental'
  gallery: {
    order: number
    swatch: { primary: string; background: string; darkBackground: string }
    badges?: string[]
  }
  fonts?: { cssUrls?: string[] }
}

export interface TemplateEntry extends RegistryBase<'template', TemplateId> {
  layout: TemplateLayoutSpec
  preview: { renderer: 'standalone-react'; component: TemplateId }
}

export interface ThemeEntry extends RegistryBase<'theme', ThemeId> {
  layoutOverrides: Partial<TemplateLayoutSpec>
  preview: { renderer: 'docs-app' }
}

export const templateRegistry: readonly RegistryEntry[] = [
  {
    kind: 'template',
    id: 'hudson',
    label: 'Hudson',
    description: 'Emerald accent with monospace headings, header bar + sidebar + TOC.',
    status: 'stable',
    gallery: {
      order: 10,
      swatch: { primary: '#059669', background: '#fafafa', darkBackground: '#0a0a0a' },
    },
    fonts: {
      cssUrls: [
        'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap',
      ],
    },
    layout: {
      header: 'bar',
      nav: 'sidebar',
      toc: 'right',
      measure: 'normal',
      density: 'normal',
      page: { breadcrumbs: true, prevNext: true, agentActions: true },
    },
    preview: { renderer: 'standalone-react', component: 'hudson' },
  },
  {
    kind: 'template',
    id: 'rail',
    label: 'Rail',
    description: 'Icon-only left rail with a wide, focused content column.',
    status: 'experimental',
    gallery: {
      order: 20,
      swatch: { primary: '#6366f1', background: '#fbfbfd', darkBackground: '#0b0b0f' },
    },
    layout: {
      header: 'minimal',
      nav: 'rail',
      toc: 'none',
      measure: 'wide',
      density: 'normal',
      page: { breadcrumbs: true, prevNext: false, agentActions: true },
    },
    preview: { renderer: 'standalone-react', component: 'rail' },
  },
  {
    kind: 'template',
    id: 'centered',
    label: 'Centered',
    description: 'No sidebar. A single narrow measure with a floating TOC.',
    status: 'experimental',
    gallery: {
      order: 30,
      swatch: { primary: '#0d9488', background: '#fcfbf8', darkBackground: '#0d0f0e' },
    },
    layout: {
      header: 'none',
      nav: 'none',
      toc: 'floating',
      measure: 'narrow',
      density: 'spacious',
      page: { breadcrumbs: false, prevNext: false, agentActions: true },
    },
    preview: { renderer: 'standalone-react', component: 'centered' },
  },
  {
    kind: 'template',
    id: 'command',
    label: 'Command',
    description: 'Command-bar-first navigation with a keyboard-forward palette.',
    status: 'experimental',
    gallery: {
      order: 40,
      swatch: { primary: '#e11d48', background: '#ffffff', darkBackground: '#0a0a0c' },
    },
    layout: {
      header: 'bar',
      nav: 'command',
      toc: 'right',
      measure: 'normal',
      density: 'compact',
      page: { breadcrumbs: true, prevNext: false, agentActions: true },
    },
    preview: { renderer: 'standalone-react', component: 'command' },
  },
  ...themeEntries(),
]

function themeEntries(): ThemeEntry[] {
  const overrides: Partial<Record<ThemeId, Partial<TemplateLayoutSpec>>> = {
    emerald: { nav: 'sidebar', density: 'spacious', cssVars: { '--dw-sidebar-width': '220px' } },
    purple: { header: 'minimal', toc: 'none', measure: 'narrow', density: 'spacious', page: { breadcrumbs: false, prevNext: true, agentActions: true } },
    dusk: { density: 'compact' },
    rose: { header: 'minimal', nav: 'none', toc: 'none', measure: 'narrow', density: 'spacious', page: { breadcrumbs: false, prevNext: false, agentActions: true } },
    github: { measure: 'wide' },
    warm: { nav: 'sidebar', toc: 'none', cssVars: { '--dw-sidebar-width': '220px' } },
    midnight: { density: 'compact' },
    mono: { header: 'minimal', nav: 'sidebar', measure: 'wide', density: 'compact', cssVars: { '--dw-sidebar-width': '220px' } },
  }

  const order: Record<ThemeId, number> = {
    neutral: 100,
    ocean: 110,
    emerald: 120,
    purple: 130,
    dusk: 140,
    rose: 150,
    github: 160,
    warm: 170,
    midnight: 180,
    mono: 190,
  }

  return (Object.keys(CREATE_THEME_SPECS) as ThemeId[]).map((id) => {
    const spec = CREATE_THEME_SPECS[id]
    return {
      kind: 'theme' as const,
      id,
      label: spec.label,
      description: spec.description,
      status: 'stable' as const,
      gallery: {
        order: order[id],
        swatch: {
          primary: spec.swatch.primary,
          background: spec.swatch.background,
          darkBackground: spec.swatch.darkBackground,
        },
      },
      fonts: spec.fontUrls ? { cssUrls: [...spec.fontUrls] } : undefined,
      layoutOverrides: overrides[id] ?? {},
      preview: { renderer: 'docs-app' as const },
    }
  })
}

export function getEntry(id: string): RegistryEntry | undefined {
  return templateRegistry.find((e) => e.id === id)
}

export function getTemplateEntry(id: string): TemplateEntry | undefined {
  const e = getEntry(id)
  return e?.kind === 'template' ? e : undefined
}

export function getThemeEntry(id: string): ThemeEntry | undefined {
  const e = getEntry(id)
  return e?.kind === 'theme' ? e : undefined
}

export function resolveThemeLayout(theme: ThemeEntry): TemplateLayoutSpec {
  const base: TemplateLayoutSpec = {
    header: 'bar',
    nav: 'sidebar',
    toc: 'right',
    measure: 'normal',
    density: 'normal',
    page: { breadcrumbs: true, prevNext: true, agentActions: true },
  }
  return { ...base, ...theme.layoutOverrides, page: { ...base.page, ...theme.layoutOverrides.page } }
}

export function getLayoutBadges(entry: RegistryEntry): string[] {
  if (entry.kind === 'template') {
    return layoutBadges(entry.layout, entry.gallery.badges)
  }
  return layoutBadges(resolveThemeLayout(entry))
}

export function getDocsAppLayout(entry: RegistryEntry): DocsAppLayoutConfig {
  const layout = entry.kind === 'template' ? entry.layout : resolveThemeLayout(entry)
  return toDocsAppLayout(layout)
}

/** Static params for /templates/[name] */
export function galleryStaticParams(): { name: string }[] {
  return templateRegistry.map((e) => ({ name: e.id }))
}

export const templateItems = templateRegistry.filter((e): e is TemplateEntry => e.kind === 'template')
export const themeItems = templateRegistry.filter((e): e is ThemeEntry => e.kind === 'theme')

// ─── Legacy aliases (gallery page + previews) ────────────────────────

export interface TocEntry {
  id: string
  text: string
  depth: 2 | 3
}

export interface TemplatePreviewProps {
  contentHtml: string
  title: string
  description: string
  toc: TocEntry[]
  themeId?: ThemeId
  layoutConfig?: DocsAppLayoutConfig
}

/** @deprecated use getEntry */
export function getTemplate(name: string) {
  const e = getEntry(name)
  if (!e) return undefined
  return {
    name: e.id,
    displayName: e.label,
    description: e.description,
    category: e.kind,
    primaryColor: e.gallery.swatch.primary,
    bgColor: e.gallery.swatch.background,
    darkBgColor: e.gallery.swatch.darkBackground,
    fontUrls: e.fonts?.cssUrls,
    preview: e.kind === 'template' ? 'standalone' : 'theme',
  }
}

/** @deprecated use galleryStaticParams */
export const templates = templateRegistry.map((e) => getTemplate(e.id)!)

/** @deprecated use getDocsAppLayout */
export function templateLayoutToConfig(name: string) {
  const entry = getEntry(name)
  const layoutConfig = entry ? getDocsAppLayout(entry) : toDocsAppLayout({
    header: 'bar',
    nav: 'sidebar',
    toc: 'right',
    measure: 'normal',
    density: 'normal',
    page: { breadcrumbs: true, prevNext: true, agentActions: true },
  })
  return { layoutConfig, cssOverrides: '' }
}