import React from 'react'
import { useDewey, useLink } from './DeweyProvider'
import { resolveIcon } from '../utils/icons'
import type { PageNode, PageItem, PageFolder } from '../types/page-tree'

// ============================================
// Types
// ============================================

export interface DocsIndexProps {
  /** Page tree for navigation cards */
  tree: PageNode[]
  /** Project/site name */
  projectName?: string
  /** Project tagline */
  tagline?: string
  /** Base path for doc links */
  basePath?: string
  /** Custom hero content */
  hero?: React.ReactNode
  /** Show search input */
  showSearch?: boolean
}

// ============================================
// Card Component
// ============================================

interface DocCardProps {
  item: PageItem
  basePath: string
}

function DocCard({ item, basePath }: DocCardProps) {
  const Link = useLink()
  const Icon = item.icon ? resolveIcon(item.icon) : null

  return (
    <Link
      href={`${basePath}/${item.id}`}
      className="dw-card group"
    >
      {Icon && (
        <div className="dw-card-icon">
          <Icon className="w-full h-full" />
        </div>
      )}
      <h3 className="dw-card-title">
        {item.name}
        {item.badge && (
          <span className={`dw-badge dw-badge-${item.badgeColor || 'default'} ml-2`}>
            {item.badge}
          </span>
        )}
      </h3>
      {item.description && (
        <p className="dw-card-description">{item.description}</p>
      )}
    </Link>
  )
}

// ============================================
// Section Component
// ============================================

interface DocSectionProps {
  folder: PageFolder
  basePath: string
}

function DocSection({ folder, basePath }: DocSectionProps) {
  const pages = folder.children.filter(
    (node): node is PageItem => node.type === 'page'
  )

  if (pages.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="text-lg font-semibold mb-4 text-[var(--color-dw-foreground)]">
        {folder.name}
      </h2>
      <div className="dw-card-grid">
        {pages.map((item) => (
          <DocCard key={item.id} item={item} basePath={basePath} />
        ))}
      </div>
    </section>
  )
}

// ============================================
// Main Component
// ============================================

export function DocsIndex({
  tree,
  projectName = 'Documentation',
  tagline,
  basePath = '/docs',
  hero,
  showSearch = false,
}: DocsIndexProps) {
  // Access provider for potential future use
  useDewey()

  // Separate top-level pages from folders
  const topLevelPages = tree.filter(
    (node): node is PageItem => node.type === 'page'
  )
  const folders = tree.filter(
    (node): node is PageFolder => node.type === 'folder'
  )

  return (
    <div className="dw-content">
      {/* Hero section */}
      {hero ?? (
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 text-[var(--color-dw-foreground)]">
            {projectName}
          </h1>
          {tagline && (
            <p className="text-lg text-[var(--color-dw-muted-foreground)] max-w-2xl mx-auto">
              {tagline}
            </p>
          )}
        </div>
      )}

      {/* Search (placeholder for now) */}
      {showSearch && (
        <div className="mb-8 max-w-xl mx-auto">
          <div className="relative">
            <input
              type="search"
              placeholder="Search documentation..."
              className="w-full px-4 py-3 rounded-lg border text-sm
                bg-[var(--color-dw-background)]
                border-[var(--color-dw-border)]
                text-[var(--color-dw-foreground)]
                placeholder:text-[var(--color-dw-muted-foreground)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-dw-ring)]"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs rounded
              bg-[var(--color-dw-secondary)]
              text-[var(--color-dw-muted-foreground)]
              border border-[var(--color-dw-border)]">
              /
            </kbd>
          </div>
        </div>
      )}

      {/* Top-level pages as cards */}
      {topLevelPages.length > 0 && (
        <section className="mb-12">
          <div className="dw-card-grid">
            {topLevelPages.map((item) => (
              <DocCard key={item.id} item={item} basePath={basePath} />
            ))}
          </div>
        </section>
      )}

      {/* Folder sections */}
      {folders.map((folder) => (
        <DocSection key={folder.name} folder={folder} basePath={basePath} />
      ))}
    </div>
  )
}

export default DocsIndex
