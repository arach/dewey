import { useMemo, useState } from 'react'
import { Menu, Sun, Moon, ArrowLeft } from 'lucide-react'
import { DeweyProvider, useDewey, useLink, type DeweyProviderProps } from './DeweyProvider'
import { Sidebar } from './Sidebar'
import { TableOfContents, extractTocItems } from './TableOfContents'
import { DocsIndex } from './DocsIndex'
import { MarkdownContent } from './MarkdownContent'
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
  /** Layout options */
  layout?: {
    sidebar?: boolean
    toc?: boolean
    header?: boolean
    footer?: boolean
    prevNext?: boolean
    breadcrumbs?: boolean
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
    sidebar: showSidebar = true,
    toc: showToc = true,
    header: showHeader = true,
    prevNext: showPrevNext = true,
    breadcrumbs: showBreadcrumbs = true,
  } = layout

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
    <div className="dw-layout">
      {/* Header */}
      {showHeader && (
        <header className="dw-header">
          <div className="dw-header-inner">
            <div className="dw-header-left">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="dw-header-menu-btn"
                style={{ display: 'none' }}
              >
                <Menu style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>

              {/* Brand */}
              <Link href={basePath} className="dw-header-brand">
                <span className="dw-header-brand-dot" />
                <span className="dw-header-brand-name">{name}</span>
              </Link>

              {/* Divider */}
              <span className="dw-header-divider" />

              {/* Home link */}
              <Link href={homeUrl} className="dw-header-back">
                <ArrowLeft className="dw-header-back-icon" />
                Home
              </Link>
            </div>

            <div className="dw-header-right">
              {/* Theme toggle */}
              <button
                onClick={toggleDark}
                className="dw-header-theme-toggle"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun style={{ width: '1rem', height: '1rem' }} /> : <Moon style={{ width: '1rem', height: '1rem' }} />}
              </button>

              {/* DOCS label */}
              <span className="dw-header-label">DOCS</span>
            </div>
          </div>
        </header>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          tree={pageTree}
          currentPage={currentPage}
          projectName={name}
          basePath={basePath}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
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
              <MarkdownContent content={content} isDark={isDark} />
            </article>

            {/* Prev/Next navigation */}
            {showPrevNext && (prevPage || nextPage) && (
              <nav className="dw-prev-next">
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
        <TableOfContents items={tocItems} />
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
