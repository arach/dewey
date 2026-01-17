import React from 'react'
import { ArrowRight, BookOpen } from 'lucide-react'
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
  /** Extended description below tagline */
  description?: string
  /** Base path for doc links */
  basePath?: string
  /** Custom hero content */
  hero?: React.ReactNode
  /** Show search input */
  showSearch?: boolean
  /** Hero icon (Lucide icon name or component) */
  heroIcon?: string | React.ComponentType<{ className?: string }>
  /** Quick links section */
  quickLinks?: Array<{
    label: string
    href: string
    external?: boolean
    primary?: boolean
  }>
  /** Layout mode for sections */
  layout?: 'stacked' | 'columns'
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
      <div className="dw-card-header">
        {Icon && (
          <div className="dw-card-icon-box">
            <Icon />
          </div>
        )}
        <div className="dw-card-content">
          <span className="dw-card-title">
            {item.name}
            {item.badge && (
              <span className={`dw-badge dw-badge-${item.badgeColor || 'default'}`}>
                {item.badge}
              </span>
            )}
          </span>
          {item.description && (
            <p className="dw-card-description">{item.description}</p>
          )}
        </div>
      </div>
      <ArrowRight className="dw-card-arrow" />
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
    <section className="dw-docs-section">
      <h2 className="dw-docs-section-title">{folder.name}</h2>
      <div className="dw-docs-section-cards">
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
  description,
  basePath = '/docs',
  hero,
  showSearch = false,
  heroIcon,
  quickLinks,
  layout = 'columns',
}: DocsIndexProps) {
  // Access provider for potential future use
  useDewey()
  const Link = useLink()

  // Resolve hero icon
  const HeroIcon = heroIcon
    ? typeof heroIcon === 'string'
      ? resolveIcon(heroIcon)
      : heroIcon
    : BookOpen

  // Separate top-level pages from folders
  const topLevelPages = tree.filter(
    (node): node is PageItem => node.type === 'page'
  )
  const folders = tree.filter(
    (node): node is PageFolder => node.type === 'folder'
  )

  return (
    <div className="dw-content dw-docs-index">
      {/* Hero section */}
      {hero ?? (
        <div className="dw-hero">
          <div className="dw-hero-icon-box">
            {HeroIcon && <HeroIcon className="dw-hero-icon" />}
          </div>
          <div className="dw-hero-content">
            <h1 className="dw-hero-title">{projectName}</h1>
            {tagline && <p className="dw-hero-tagline">{tagline}</p>}
          </div>
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="dw-docs-description">{description}</p>
      )}

      {/* Search (placeholder for now) */}
      {showSearch && (
        <div className="dw-search-box">
          <div className="dw-search-box-inner">
            <input
              type="search"
              placeholder="Search documentation..."
              className="dw-search-input"
            />
            <kbd className="dw-search-kbd">/</kbd>
          </div>
        </div>
      )}

      {/* Top-level pages as cards */}
      {topLevelPages.length > 0 && (
        <section className="dw-docs-section">
          <div className="dw-docs-section-cards">
            {topLevelPages.map((item) => (
              <DocCard key={item.id} item={item} basePath={basePath} />
            ))}
          </div>
        </section>
      )}

      {/* Folder sections in two-column layout */}
      <div className={`dw-docs-sections ${layout === 'columns' ? 'dw-docs-sections-columns' : ''}`}>
        {folders.map((folder) => (
          <DocSection key={folder.name} folder={folder} basePath={basePath} />
        ))}
      </div>

      {/* Quick links at bottom */}
      {quickLinks && quickLinks.length > 0 && (
        <div className="dw-docs-quick-links">
          <h3 className="dw-docs-section-title">Quick Links</h3>
          <div className="dw-docs-quick-links-buttons">
            {quickLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={`dw-docs-quick-link ${link.primary ? 'dw-docs-quick-link-primary' : ''}`}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {link.label}
                {link.external && <ArrowRight className="dw-quick-link-icon" />}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DocsIndex
