/**
 * Page Tree Types
 *
 * Navigation structure for documentation sites.
 * Inspired by Fumadocs page tree system.
 */

/**
 * A page in the documentation tree
 */
export interface PageItem {
  type: 'page'
  /** Unique identifier (used for URL matching) */
  id: string
  /** Display name in navigation */
  name: string
  /** URL path (optional, computed from basePath + id if not provided) */
  url?: string
  /** Lucide icon name (e.g., 'BookOpen', 'Code') */
  icon?: string
  /** Short description shown in cards/tooltips */
  description?: string
  /** Badge text (e.g., 'New', 'Beta') */
  badge?: string
  /** Badge color variant */
  badgeColor?: 'info' | 'success' | 'warning' | 'error' | 'default'
}

/**
 * A folder/group in the navigation
 */
export interface PageFolder {
  type: 'folder'
  /** Display name for the group */
  name: string
  /** Lucide icon name */
  icon?: string
  /** Whether folder is expanded by default */
  defaultOpen?: boolean
  /** Child pages and subfolders */
  children: PageNode[]
  /** Optional index page for the folder */
  index?: PageItem
}

/**
 * A visual separator in the navigation
 */
export interface PageSeparator {
  type: 'separator'
  /** Optional label for the separator */
  name?: string
}

/**
 * Union type for all navigation nodes
 */
export type PageNode = PageItem | PageFolder | PageSeparator

/**
 * Root of the page tree
 */
export interface PageTree {
  /** Site/docs name */
  name: string
  /** Root-level navigation items */
  children: PageNode[]
}

/**
 * Flattened page for search/iteration
 */
export interface FlatPage {
  id: string
  name: string
  url?: string
  description?: string
  /** Breadcrumb path (folder names) */
  breadcrumb: string[]
}

/**
 * Navigation configuration (used in dewey.config)
 */
export interface NavigationGroup {
  /** Group title */
  title: string
  /** Whether group is collapsed by default */
  collapsed?: boolean
  /** Items in this group */
  items: NavigationItem[]
}

export interface NavigationItem {
  /** Page ID (matches markdown filename without .md) */
  id: string
  /** Display title */
  title: string
  /** Lucide icon name */
  icon?: string
  /** Short description */
  description?: string
  /** Badge text */
  badge?: string
  /** Badge color */
  badgeColor?: 'info' | 'success' | 'warning' | 'error' | 'default'
}

/**
 * Navigation configuration type
 */
export type NavigationConfig = NavigationGroup[]
