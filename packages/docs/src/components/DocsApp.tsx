import { useMemo, useState, type CSSProperties } from 'react'
import { Menu, Sun, Moon, ArrowLeft } from 'lucide-react'
import { DeweyProvider, useDewey, useLink, type DeweyProviderProps } from './DeweyProvider'
import { Sidebar } from './Sidebar'
import { RailNav } from './RailNav'
import { CommandPalette } from './CommandPalette'
import { TableOfContents, extractTocItems } from './TableOfContents'
import { DocsIndex } from './DocsIndex'
import { MarkdownContent } from './MarkdownContent'
import { MEASURE_WIDTH, DENSITY_VARS } from '../templates/registry'
import type { PageNode, PageItem, NavigationConfig } from '../types/page-tree'

// ============================================
// Types
// ============================================

export interface DocsAppConfig {
  /** Project name */
  name: string
  /** Project tagline */
  tagline?: string
  /** Base path for docs (default: '/docs') */
  basePath?: string
  /** Link back to main site */
  homeUrl?: string
  /** Navigation structure */
  navigation?: NavigationConfig
  /** Layout options — see TemplateLayoutSpec for the full model */
  layout?: {
    /** Navigation surface (default: 'sidebar'). */
    nav?: 'sidebar' | 'rail' | 'command' | 'none'
    /** @deprecated use nav: 'none' */
    sidebar?: boolean
    /** TOC placement (default: 'right'); boolean: true→'right', false→'none' */
    toc?: 'right' | 'floating' | 'inline' | 'none' | boolean
    header?: boolean | 'minimal'
    footer?: boolean
    prevNext?: boolean
    breadcrumbs?: boolean
    /** Content measure; 'split' lifts code blocks into a right rail */
    measure?: 'narrow' | 'normal' | 'wide' | 'split'
    density?: 'compact' | 'normal' | 'spacious'
    /** Number sidebar items sequentially (handbook navigation) */
    numbered?: boolean
    /** Skin key → `dw-skin-<skin>` class on the layout root */
    skin?: string
  }
}

export interface DocsAppProps {
  /** Configuration object */
  config?: DocsAppConfig
  /** Documentation content as Record<id, markdown> */
  docs: Record<string, string>
  /** Currently active page (for router-agnostic usage) */
  currentPage?: string
  /** Navigation callback when page changes */
  onNavigate?: (pageId: string) => void
  /** Provider props (theme, components) */
  providerProps?: Omit<DeweyProviderProps, 'children'>
}

// ============================================
// Build Page Tree from Config
// ============================================

function buildPageTree(navigation: NavigationConfig | undefined, docs: Record<string, string>): PageNode[] {
  if (!navigation) {
    // Auto-generate from docs keys
    return Object.keys(docs).map((id) => ({
      type: 'page' as const,
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' '),
      url: `/${id}`,
    }))
  }

  const tree: PageNode[] = []

  for (const group of navigation) {
    const folder: PageNode = {
      type: 'folder',
      name: group.title,
      icon: group.icon,
      defaultOpen: !group.collapsed,
      children: group.items.map((item) => ({
        type: 'page' as const,
        id: item.id,
        name: item.title,
        url: `/${item.id}`,
        icon: item.icon,
        description: item.description,
        badge: item.badge,
        badgeColor: item.badgeColor,
      })),
    }
    tree.push(folder)
  }

  return tree
}

// ============================================
// Internal Layout Component
// ============================================

interface DocsLayoutInternalProps {
  config: DocsAppConfig
  docs: Record<string, string>
  currentPage?: string
  pageTree: PageNode[]
}

interface BreadcrumbItem {
  label: string
  href?: string
}

function DocsLayoutInternal({
  config,
  docs,
  currentPage,
  pageTree,
}: DocsLayoutInternalProps) {
  const { isDark, toggleDark } = useDewey()
  const Link = useLink()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const {
    name,
    tagline,
    basePath = '/docs',
    homeUrl = '/',
    layout = {},
  } = config

  const {
    header: headerOption = true,
    prevNext: showPrevNext = true,
    breadcrumbs: showBreadcrumbs = true,
    numbered = false,
    skin,
    measure = 'normal',
    density = 'normal',
  } = layout

  // Normalize nav: explicit nav wins; legacy `sidebar: false` maps to 'none'
  const navMode = layout.nav ?? (layout.sidebar === false ? 'none' : 'sidebar')
  const showSidebar = navMode === 'sidebar'
  const showRail = navMode === 'rail'
  const showCommand = navMode === 'command'

  // Normalize toc: boolean → placement; 'inline' → 'right'
  const tocMode =
    layout.toc === false ? 'none'
    : layout.toc === true ? 'right'
    : layout.toc ?? 'right'
  const showToc = tocMode !== 'none'

  const showHeader = headerOption !== false
  const isMinimalHeader = headerOption === 'minimal'

  // Measure + density resolve to CSS vars on the layout root
  const layoutVars = useMemo(() => {
    const vars: Record<string, string> = {}
    for (const [k, v] of Object.entries(DENSITY_VARS[density])) {
      if (v !== undefined) vars[k] = v
    }
    if (measure !== 'normal') vars['--dw-content-max-width'] = MEASURE_WIDTH[measure]
    return vars as CSSProperties
  }, [measure, density])

  // Get current content
  const content = currentPage ? docs[currentPage] : null
  const isIndex = !currentPage || currentPage === 'index'

  // Extract TOC from content
  const tocItems = useMemo(() => {
    if (!content) return []
    return extractTocItems(content)
  }, [content])

  // Find prev/next pages
  const flatPages = useMemo(() => {
    const pages: PageItem[] = []
    const traverse = (nodes: PageNode[]) => {
      for (const node of nodes) {
        if (node.type === 'page') {
          pages.push(node)
        } else if (node.type === 'folder') {
          traverse(node.children)
        }
      }
    }
    traverse(pageTree)
    return pages
  }, [pageTree])

  const currentIndex = flatPages.findIndex((p) => p.id === currentPage)
  const prevPage = currentIndex > 0 ? flatPages[currentIndex - 1] : null
  const nextPage = currentIndex < flatPages.length - 1 ? flatPages[currentIndex + 1] : null

  const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
    if (!currentPage || currentPage === 'index') {
      return [{ label: name, href: basePath }]
    }

    const items: BreadcrumbItem[] = [{ label: name, href: basePath }]
    let groupLabel: string | null = null

    if (config.navigation) {
      for (const group of config.navigation) {
        const match = group.items.find((item) => item.id === currentPage)
        if (match) {
          groupLabel = group.title
          break
        }
      }
    }

    if (groupLabel) {
      items.push({ label: groupLabel })
    }

    const currentItem = flatPages.find((page) => page.id === currentPage)
    const currentLabel = currentItem?.name || currentPage
    items.push({ label: currentLabel, href: `${basePath}/${currentPage}` })

    return items
  }, [basePath, currentPage, config.navigation, flatPages, name])

  return (
    <div
      className={`dw-layout${skin ? ` dw-skin-${skin}` : ''}`}
      data-nav={navMode}
      data-measure={measure}
      style={layoutVars}
    >
      {/* Header */}
      {showHeader && (
        <header className={`dw-header${isMinimalHeader ? ' dw-header-minimal' : ''}`}>
          <div className="dw-header-inner">
            <div className="dw-header-left">
              {/* Mobile menu button (only when a sidebar exists) */}
              {showSidebar && (
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="dw-header-menu-btn"
                style={{ display: 'none' }}
                aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={sidebarOpen}
              >
                <Menu style={{ width: '1.25rem', height: '1.25rem' }} aria-hidden="true" />
              </button>
              )}

              {/* Brand */}
              <Link href={basePath} className="dw-header-brand">
                <span className="dw-header-brand-dot" aria-hidden="true" />
                <span className="dw-header-brand-name">{name}</span>
              </Link>

              {/* Divider */}
              <span className="dw-header-divider" aria-hidden="true" />

              {/* Home link */}
              <Link href={homeUrl} className="dw-header-back">
                <ArrowLeft className="dw-header-back-icon" aria-hidden="true" />
                Home
              </Link>
            </div>

            {/* Command bar is the primary nav surface in command mode */}
            {showCommand && (
              <div className="dw-header-center">
                <CommandPalette tree={pageTree} basePath={basePath} />
              </div>
            )}

            <div className="dw-header-right">
              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleDark}
                className="dw-header-theme-toggle"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun style={{ width: '1rem', height: '1rem' }} aria-hidden="true" /> : <Moon style={{ width: '1rem', height: '1rem' }} aria-hidden="true" />}
              </button>

              {/* DOCS label */}
              <span className="dw-header-label">DOCS</span>
            </div>
          </div>
        </header>
      )}

      {/* Navigation surfaces */}
      {showSidebar && (
        <Sidebar
          tree={pageTree}
          currentPage={currentPage}
          projectName={name}
          basePath={basePath}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          numbered={numbered}
        />
      )}

      {showRail && (
        <RailNav
          tree={pageTree}
          currentPage={currentPage}
          projectName={name}
          basePath={basePath}
        />
      )}

      {/* Main content */}
      <main className="dw-main">
        {isIndex ? (
          <DocsIndex
            tree={pageTree}
            projectName={name}
            tagline={tagline}
            basePath={basePath}
          />
        ) : content ? (
          <div className="dw-content">
            {showBreadcrumbs && (
              <nav className="dw-breadcrumbs" aria-label="Breadcrumb">
                <ol className="dw-breadcrumbs-list">
                  {breadcrumbItems.map((item, index) => (
                    <li key={`${item.label}-${index}`} className="dw-breadcrumbs-item">
                      {item.href ? (
                        <Link href={item.href} className="dw-breadcrumbs-link">
                          {item.label}
                        </Link>
                      ) : (
                        <span className="dw-breadcrumbs-label">{item.label}</span>
                      )}
                      {index < breadcrumbItems.length - 1 && (
                        <span className="dw-breadcrumbs-separator">/</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <article className="dw-prose">
              <MarkdownContent content={content} isDark={isDark} split={measure === 'split'} />
            </article>

            {/* Prev/Next navigation */}
            {showPrevNext && (prevPage || nextPage) && (
              <nav className="dw-prev-next" aria-label="Previous and next pages">
                {prevPage ? (
                  <Link
                    href={`${basePath}/${prevPage.id}`}
                    className="dw-prev-next-link"
                  >
                    <ArrowLeft className="dw-prev-next-icon" />
                    <div>
                      <div className="dw-prev-next-label">Previous</div>
                      <div className="dw-prev-next-title">{prevPage.name}</div>
                    </div>
                  </Link>
                ) : <div />}
                {nextPage ? (
                  <Link
                    href={`${basePath}/${nextPage.id}`}
                    className="dw-prev-next-link dw-prev-next-link-next"
                  >
                    <div style={{ textAlign: 'right' }}>
                      <div className="dw-prev-next-label">Next</div>
                      <div className="dw-prev-next-title">{nextPage.name}</div>
                    </div>
                    <ArrowLeft className="dw-prev-next-icon dw-prev-next-icon-next" />
                  </Link>
                ) : <div />}
              </nav>
            )}
          </div>
        ) : (
          <div className="dw-content">
            <p style={{ color: 'var(--dw-muted-foreground)' }}>
              Page not found: {currentPage}
            </p>
          </div>
        )}
      </main>

      {/* Table of Contents */}
      {showToc && !isIndex && tocItems.length > 0 && (
        <TableOfContents
          items={tocItems}
          className={tocMode === 'floating' ? 'dw-toc-floating' : undefined}
        />
      )}
    </div>
  )
}

// ============================================
// Main DocsApp Component
// ============================================

export function DocsApp({
  config = { name: 'Docs' },
  docs,
  currentPage,
  onNavigate: _onNavigate,  // Reserved for future use
  providerProps = {},
}: DocsAppProps) {
  // Build page tree from navigation config
  const pageTree = useMemo(
    () => buildPageTree(config.navigation, docs),
    [config.navigation, docs]
  )

  return (
    <DeweyProvider {...providerProps}>
      <DocsLayoutInternal
        config={config}
        docs={docs}
        currentPage={currentPage}
        pageTree={pageTree}
      />
    </DeweyProvider>
  )
}

export default DocsApp
