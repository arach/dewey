import { useMemo, type AnchorHTMLAttributes } from 'react'
import { DocsApp } from '../../components/DocsApp'
import { DeweyProvider } from '../../components/DeweyProvider'
import { CommandPalette } from '../../components/CommandPalette'
import type { NavigationConfig, PageNode } from '../../types/page-tree'

export const SITE_THEMES = ['ocean', 'neutral', 'emerald', 'editorial'] as const
export interface RendererData {
  name: string
  purpose: string
  currentPage: string
  route: string
  rootPrefix: string
  content: string
  navigation: NavigationConfig
}

/** Static markup from the library's own components. The browser script adds behavior; nothing hydrates. */
export function FreshDocs({ data }: { data: RendererData }) {
  const Link = useMemo(() => function StaticLink({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    const destination = href === '' || href === '/' ? `${data.rootPrefix}index.html`
      : href.startsWith('/') && !href.startsWith('//') ? `${data.rootPrefix}${href.slice(1)}` : href
    return <a {...props} href={destination} />
  }, [data.rootPrefix])
  const tree: PageNode[] = data.navigation.map(group => ({ type: 'folder', name: group.title, defaultOpen: true, children: group.items.map(item => ({ type: 'page', id: item.id, name: item.title })) }))
  const providerProps = { theme: 'ocean' as const, components: { Link }, storageKey: 'dewey-dark-mode' }
  // Only the current page's Markdown is rendered; other pages are links.
  const docs = { [data.currentPage]: data.content }
  return <>
    <DocsApp docs={docs} currentPage={data.currentPage} providerProps={providerProps} config={{
      name: data.name, tagline: data.purpose, basePath: '', homeUrl: '/index.html', navigation: data.navigation,
      layout: { nav: 'sidebar', toc: 'right', header: true, prevNext: true, breadcrumbs: true },
    }} />
    <DeweyProvider {...providerProps}>
      <div className="dw-fresh-tools" aria-label="Documentation tools">
        <CommandPalette tree={tree} basePath="" placeholder="Search documentation…" />
        <label className="dw-fresh-theme"><span>Theme</span><select aria-label="Color theme" defaultValue="ocean">{SITE_THEMES.map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
      </div>
    </DeweyProvider>
  </>
}
