import { useEffect, useMemo, useState } from 'react'
import { Search, FileText, CornerDownLeft } from 'lucide-react'
import { useLink } from './DeweyProvider'
import type { PageNode, PageItem } from '../types/page-tree'

export interface CommandPaletteProps {
  tree: PageNode[]
  basePath?: string
  placeholder?: string
}

interface PaletteItem {
  id: string
  title: string
  group: string
}

function flatten(tree: PageNode[], group = ''): PaletteItem[] {
  const items: PaletteItem[] = []
  for (const node of tree) {
    if (node.type === 'folder') {
      items.push(...flatten(node.children, node.name))
    } else if (node.type === 'page') {
      items.push({ id: (node as PageItem).id, title: (node as PageItem).name, group })
    }
  }
  return items
}

/**
 * Command-bar-first navigation. The trigger sits in the header; ⌘K or click
 * opens a palette that navigates real pages.
 */
export function CommandPalette({ tree, basePath = '/docs', placeholder = 'Search docs or run a command…' }: CommandPaletteProps) {
  const Link = useLink()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const items = useMemo(() => flatten(tree), [tree])
  const q = query.trim().toLowerCase()
  const filtered = q ? items.filter((i) => i.title.toLowerCase().includes(q)) : items

  return (
    <>
      <button type="button" className="dw-cmd-trigger" onClick={() => setOpen(true)}>
        <Search className="dw-cmd-trigger-icon" aria-hidden="true" />
        <span className="dw-cmd-trigger-text">{placeholder}</span>
        <kbd className="dw-cmd-kbd">⌘K</kbd>
      </button>

      {open && (
        <div className="dw-cmd-overlay" onClick={() => setOpen(false)}>
          <div className="dw-cmd-palette" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search docs">
            <div className="dw-cmd-input-row">
              <Search className="dw-cmd-input-icon" aria-hidden="true" />
              <input
                autoFocus
                className="dw-cmd-input"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd className="dw-cmd-kbd">esc</kbd>
            </div>
            <div className="dw-cmd-results">
              {filtered.map((item) => (
                <Link
                  key={`${item.group}/${item.title}`}
                  href={`${basePath}/${item.id}`}
                  className="dw-cmd-result"
                  onClick={() => {
                    setOpen(false)
                    setQuery('')
                  }}
                >
                  <FileText className="dw-cmd-result-icon" aria-hidden="true" />
                  <span className="dw-cmd-result-title">{item.title}</span>
                  <span className="dw-cmd-result-meta">{item.group}</span>
                  <CornerDownLeft className="dw-cmd-result-enter" aria-hidden="true" />
                </Link>
              ))}
              {filtered.length === 0 && (
                <p className="dw-cmd-empty">No pages match “{query}”.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CommandPalette
