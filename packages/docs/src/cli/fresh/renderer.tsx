import { useMemo, type AnchorHTMLAttributes } from 'react'
import { DocsApp } from '../../components/DocsApp'
import { CommandPalette } from '../../components/CommandPalette'
import type { NavigationConfig, PageNode } from '../../types/page-tree'

export const SITE_THEMES = ['ink', 'ocean', 'neutral', 'emerald', 'editorial', 'slate'] as const
export interface RendererData {
  name: string
  purpose: string
  currentPage: string
  route: string
  rootPrefix: string
  content: string
  navigation: NavigationConfig
  /** A house site's look; it owns the palette, so the color theme menu is left out. */
  skin?: string
  /** The project's chosen color theme; visitors then only toggle light and dark. */
  theme?: string
  /** Header links from the project's site config, the product home first. */
  links?: { label: string; href: string; home?: boolean }[]
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
  // Search and theme sit in the header; site.js wires them up.
  const links = data.links?.length ? <div className="dw-site-links">
    {data.links.map(link => <a key={link.href} className={link.home ? 'dw-site-link dw-site-link-home' : 'dw-site-link'} href={link.href}>{link.label}</a>)}
  </div> : null
  const actions = <>{links}<div className="dw-fresh-tools">
    <CommandPalette tree={tree} basePath="" placeholder="Search documentation…" />
    {!data.skin && !data.theme && <select className="dw-fresh-theme" aria-label="Color theme" defaultValue="ink">{SITE_THEMES.map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select>}
  </div></>
  return <DocsApp docs={docs} currentPage={data.currentPage} providerProps={providerProps} config={{
    name: data.name, tagline: data.purpose, basePath: '', homeUrl: false, headerLabel: false, headerActions: actions, navigation: data.navigation,
    layout: { skin: data.skin, nav: 'sidebar', toc: 'right', header: true, prevNext: true, breadcrumbs: !data.skin && data.currentPage !== data.navigation[0]?.items[0]?.id },
  }} />
}
