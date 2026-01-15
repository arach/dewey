import React from 'react'
import { Book, X } from 'lucide-react'
import { useDewey, useLink } from './DeweyProvider'
import { resolveIcon } from '../utils/icons'
import type { PageNode, PageFolder, PageItem } from '../types/page-tree'

// ============================================
// Types
// ============================================

export interface SidebarProps {
  /** Page tree for navigation */
  tree: PageNode[]
  /** Currently active page ID */
  currentPage?: string
  /** Project/site name */
  projectName?: string
  /** Base path for doc links */
  basePath?: string
  /** Whether sidebar is open (mobile) */
  isOpen?: boolean
  /** Callback to close sidebar (mobile) */
  onClose?: () => void
  /** Custom header content */
  header?: React.ReactNode
  /** Custom footer content */
  footer?: React.ReactNode
}

// ============================================
// Sidebar Item Component
// ============================================

interface SidebarItemProps {
  item: PageItem
  isActive: boolean
  basePath: string
  onNavigate?: () => void
}

function SidebarItem({ item, isActive, basePath, onNavigate }: SidebarItemProps) {
  const Link = useLink()
  const Icon = item.icon ? resolveIcon(item.icon) : null

  return (
    <li>
      <Link
        href={`${basePath}/${item.id}`}
        onClick={onNavigate}
        className={`dw-sidebar-item ${isActive ? 'active' : ''}`}
      >
        {Icon && <Icon className="dw-sidebar-item-icon" />}
        <span>{item.name}</span>
        {item.badge && (
          <span className={`dw-badge dw-badge-${item.badgeColor || 'default'}`}>
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  )
}

// ============================================
// Sidebar Folder Component
// ============================================

interface SidebarFolderProps {
  folder: PageFolder
  currentPage?: string
  basePath: string
  onNavigate?: () => void
}

function SidebarFolder({ folder, currentPage, basePath, onNavigate }: SidebarFolderProps) {
  const [isOpen, setIsOpen] = React.useState(folder.defaultOpen ?? true)
  const Icon = folder.icon ? resolveIcon(folder.icon) : null

  return (
    <div className="dw-sidebar-group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="dw-sidebar-group-title"
      >
        {Icon && <Icon className="dw-sidebar-item-icon" />}
        <span>{folder.name}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {isOpen && (
        <ul className="space-y-1">
          {folder.children.map((child) => (
            <SidebarNode
              key={child.type === 'separator' ? `sep-${child.name}` : (child as PageItem).id || (child as PageFolder).name}
              node={child}
              currentPage={currentPage}
              basePath={basePath}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

// ============================================
// Sidebar Node (recursive)
// ============================================

interface SidebarNodeProps {
  node: PageNode
  currentPage?: string
  basePath: string
  onNavigate?: () => void
}

function SidebarNode({ node, currentPage, basePath, onNavigate }: SidebarNodeProps) {
  if (node.type === 'separator') {
    return (
      <li className="py-2">
        {node.name && (
          <span className="dw-sidebar-group-title">{node.name}</span>
        )}
        {!node.name && <hr className="border-t border-[var(--color-dw-border)]" />}
      </li>
    )
  }

  if (node.type === 'folder') {
    return (
      <SidebarFolder
        folder={node}
        currentPage={currentPage}
        basePath={basePath}
        onNavigate={onNavigate}
      />
    )
  }

  // PageItem
  return (
    <SidebarItem
      item={node}
      isActive={currentPage === node.id}
      basePath={basePath}
      onNavigate={onNavigate}
    />
  )
}

// ============================================
// Main Sidebar Component
// ============================================

export function Sidebar({
  tree,
  currentPage,
  projectName = 'Docs',
  basePath = '/docs',
  isOpen = false,
  onClose,
  header,
  footer,
}: SidebarProps) {
  const { isDark } = useDewey()
  const Link = useLink()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dw-sidebar ${isOpen ? 'open' : ''}`}
        data-dark={isDark}
      >
        {/* Header */}
        <div className="dw-sidebar-header">
          {header ?? (
            <Link href={basePath} className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              <span className="dw-sidebar-title">{projectName}</span>
            </Link>
          )}

          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 -mr-1"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="dw-sidebar-nav">
          <ul className="space-y-1">
            {tree.map((node) => (
              <SidebarNode
                key={node.type === 'separator' ? `sep-${node.name}` : (node as PageItem).id || (node as PageFolder).name}
                node={node}
                currentPage={currentPage}
                basePath={basePath}
                onNavigate={onClose}
              />
            ))}
          </ul>
        </nav>

        {/* Footer */}
        {footer && (
          <div className="mt-auto p-4 border-t border-[var(--color-dw-sidebar-border)]">
            {footer}
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar
