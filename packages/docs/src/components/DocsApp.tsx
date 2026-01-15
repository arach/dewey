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

  return (
    <div className="dw-layout">
      {/* Header */}
      {showHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4
          bg-[var(--color-dw-background)]/90 backdrop-blur-md
          border-b border-[var(--color-dw-border)]">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 -ml-2 text-[var(--color-dw-muted-foreground)]"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand */}
            <Link href={basePath} className="flex items-center gap-2 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-dw-primary)]" />
              <span className="text-[var(--color-dw-foreground)]">{name}</span>
            </Link>

            {/* Divider */}
            <span className="hidden sm:block w-px h-4 bg-[var(--color-dw-border)]" />

            {/* Home link */}
            <Link
              href={homeUrl}
              className="hidden sm:flex items-center gap-1 text-xs uppercase tracking-wider
                text-[var(--color-dw-muted-foreground)] hover:text-[var(--color-dw-foreground)]"
            >
              <ArrowLeft className="w-3 h-3" />
              Home
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={toggleDark}
              className="p-1.5 rounded text-[var(--color-dw-muted-foreground)]
                hover:text-[var(--color-dw-foreground)]"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* DOCS label */}
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em]
              text-[var(--color-dw-foreground)]">
              DOCS
            </span>
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
      <main className={`dw-main ${showHeader ? 'pt-14' : ''} ${showSidebar ? 'lg:pl-[280px]' : ''} ${showToc ? 'xl:pr-[220px]' : ''}`}>
        {isIndex ? (
          <DocsIndex
            tree={pageTree}
            projectName={name}
            tagline={tagline}
            basePath={basePath}
          />
        ) : content ? (
          <div className="dw-content">
            <article className="dw-prose">
              <MarkdownContent content={content} isDark={isDark} />
            </article>

            {/* Prev/Next navigation */}
            {showPrevNext && (prevPage || nextPage) && (
              <nav className="mt-12 pt-6 border-t border-[var(--color-dw-border)] flex justify-between">
                {prevPage ? (
                  <Link
                    href={`${basePath}/${prevPage.id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border
                      border-[var(--color-dw-border)] text-[var(--color-dw-muted-foreground)]
                      hover:text-[var(--color-dw-foreground)] hover:border-[var(--color-dw-ring)]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wider opacity-60">Previous</div>
                      <div className="text-sm font-medium">{prevPage.name}</div>
                    </div>
                  </Link>
                ) : <div />}
                {nextPage ? (
                  <Link
                    href={`${basePath}/${nextPage.id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border
                      border-[var(--color-dw-border)] text-[var(--color-dw-muted-foreground)]
                      hover:text-[var(--color-dw-foreground)] hover:border-[var(--color-dw-ring)]"
                  >
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider opacity-60">Next</div>
                      <div className="text-sm font-medium">{nextPage.name}</div>
                    </div>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Link>
                ) : <div />}
              </nav>
            )}
          </div>
        ) : (
          <div className="dw-content">
            <p className="text-[var(--color-dw-muted-foreground)]">
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
