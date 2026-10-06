import { useEffect, useMemo, useState, type AnchorHTMLAttributes } from 'react'
import { DocsApp } from '../../components/DocsApp'
import { DeweyProvider } from '../../components/DeweyProvider'
import { CommandPalette } from '../../components/CommandPalette'
import type { NavigationConfig, PageNode } from '../../types/page-tree'
import type { ThemePreset } from '../../themes'

export const SITE_THEMES = ['ocean', 'neutral', 'emerald', 'editorial'] as const
export interface RendererData {
  name: string
  purpose: string
  currentPage: string
  route: string
  rootPrefix: string
  docs: Record<string, string>
  navigation: NavigationConfig
}

/** Thin static-file adapter around the actual library. No parallel docs UI. */
export function FreshDocs({ data }: { data: RendererData }) {
  const [theme, setTheme] = useState<ThemePreset>('ocean')
  useEffect(() => {
    const saved = localStorage.getItem('dewey-site-theme')
    if (SITE_THEMES.some(value => value === saved)) setTheme(saved as ThemePreset)
  }, [])
  useEffect(() => {
    const link = document.getElementById('dewey-preset') as HTMLLinkElement | null
    if (link) link.href = `${data.rootPrefix}themes/${theme}.css`
  }, [theme, data.rootPrefix])
  const Link = useMemo(() => function StaticLink({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    const destination = href === '' || href === '/' ? `${data.rootPrefix}index.html`
      : href.startsWith('/') && !href.startsWith('//') ? `${data.rootPrefix}${href.slice(1)}` : href
    return <a {...props} href={destination} />
  }, [data.rootPrefix])
  const tree: PageNode[] = data.navigation.map(group => ({ type: 'folder', name: group.title, defaultOpen: true, children: group.items.map(item => ({ type: 'page', id: item.id, name: item.title })) }))
  const providerProps = { theme, components: { Link }, storageKey: 'dewey-dark-mode' }
  // A common renderer API: works with both the existing release and newer header variants.
  const searchProps = { tree, basePath: '', docs: data.docs, placeholder: 'Search documentation…' }
  return <>
    <DocsApp docs={data.docs} currentPage={data.currentPage} providerProps={providerProps} config={{
      name: data.name, tagline: data.purpose, basePath: '', homeUrl: '/index.html', navigation: data.navigation,
      layout: { nav: 'sidebar', toc: 'right', header: true, prevNext: true, breadcrumbs: true },
    }} />
    <DeweyProvider {...providerProps}>
      <div className="dw-fresh-tools" aria-label="Documentation tools">
        <CommandPalette {...searchProps} />
        <label className="dw-fresh-theme"><span>Theme</span><select aria-label="Color theme" value={theme} onChange={event => {
          const next = event.target.value as ThemePreset
          setTheme(next)
          localStorage.setItem('dewey-site-theme', next)
        }}>{SITE_THEMES.map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
      </div>
    </DeweyProvider>
  </>
}
