import type { ComponentType } from 'react'

/**
 * Navigation item for the docs sidebar
 */
export interface NavItem {
  /** Unique identifier, used in URLs */
  id: string
  /** Display title */
  title: string
  /** Optional icon component */
  icon?: ComponentType<{ className?: string }>
  /** Short description */
  description?: string
}

/**
 * Group of navigation items
 */
export interface NavGroup {
  /** Section title */
  title: string
  /** Items in this section */
  items: NavItem[]
}

/**
 * Section for table of contents
 */
export interface DocSection {
  /** HTML id attribute */
  id: string
  /** Section title */
  title: string
  /** Heading level (h2 or h3) */
  level: 2 | 3
}

/**
 * Badge color options
 */
export type BadgeColor = 'blue' | 'emerald' | 'purple' | 'amber' | 'rose'

/**
 * Page navigation link
 */
export interface PageLink {
  /** Page identifier */
  id: string
  /** Page title */
  title: string
}

/**
 * Configuration for DocsLayout
 */
export interface DocsConfig {
  /** Project name shown in header */
  projectName: string
  /** Base URL path for docs (default: /docs) */
  basePath?: string
  /** URL for home link (default: /) */
  homeUrl?: string
  /** Navigation structure */
  navigation: NavGroup[]
}
