import { Book, Sun, Moon } from 'lucide-react'
import { useDewey, useLink } from './DeweyProvider'
import { resolveIcon } from '../utils/icons'
import type { PageNode, PageItem } from '../types/page-tree'

export interface RailNavProps {
  tree: PageNode[]
  currentPage?: string
  projectName?: string
  basePath?: string
}

function firstPageId(node: PageNode): string | undefined {
  if (node.type === 'page') return node.id
  if (node.type === 'folder') {
    for (const child of node.children) {
      const id = firstPageId(child)
      if (id) return id
    }
  }
  return undefined
}

function nodeContainsPage(node: PageNode, pageId: string | undefined): boolean {
  if (!pageId) return false
  if (node.type === 'page') return node.id === pageId
  if (node.type === 'folder') return node.children.some((c) => nodeContainsPage(c, pageId))
  return false
}

/** Icon-only vertical rail — one button per top-level nav group. */
export function RailNav({ tree, currentPage, projectName, basePath = '/docs' }: RailNavProps) {
  const { isDark, toggleDark } = useDewey()
  const Link = useLink()

  return (
    <nav className="dw-rail" aria-label="Sections">
      <Link href={basePath} className="dw-rail-brand" title={projectName}>
        <Book style={{ width: 16, height: 16 }} aria-hidden="true" />
      </Link>
      <div className="dw-rail-items">
        {tree.map((node) => {
          const label = node.type === 'folder' ? node.name : (node as PageItem).name
          const target = node.type === 'page' ? node.id : firstPageId(node)
          const Icon = node.type !== 'separator' && node.icon ? resolveIcon(node.icon) : null
          const active = nodeContainsPage(node, currentPage)
          if (!target) return null
          return (
            <Link
              key={label}
              href={`${basePath}/${target}`}
              className={`dw-rail-item${active ? ' dw-rail-item-active' : ''}`}
              title={label}
              aria-current={active ? 'page' : undefined}
            >
              {Icon ? (
                <Icon className="dw-rail-icon" aria-hidden="true" />
              ) : (
                <span className="dw-rail-glyph">{label.charAt(0)}</span>
              )}
              <span className="dw-rail-tip">{label}</span>
            </Link>
          )
        })}
      </div>
      <div className="dw-rail-foot">
        <button
          type="button"
          onClick={toggleDark}
          className="dw-rail-item"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun className="dw-rail-icon" aria-hidden="true" />
          ) : (
            <Moon className="dw-rail-icon" aria-hidden="true" />
          )}
        </button>
      </div>
    </nav>
  )
}

export default RailNav
