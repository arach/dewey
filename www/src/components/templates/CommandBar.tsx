'use client'

import { useEffect, useState } from 'react'
import { Search, CornerDownLeft, FileText, Hash, Terminal } from 'lucide-react'
import { sampleNav, sampleAgentLinks } from '@/lib/sample-doc'

// The command bar is the primary navigation surface for this template.
// Clicking it (or pressing ⌘K) opens a mock palette listing docs + commands.
export function CommandBar() {
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

  const pages = sampleNav.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title })))
  const q = query.trim().toLowerCase()
  const filtered = q ? pages.filter((p) => p.title.toLowerCase().includes(q)) : pages

  return (
    <>
      <button className="cmd-trigger" onClick={() => setOpen(true)}>
        <Search size={15} strokeWidth={2} />
        <span className="cmd-trigger-text">Search docs or run a command…</span>
        <kbd className="cmd-kbd">⌘K</kbd>
      </button>

      {open && (
        <div className="cmd-overlay" onClick={() => setOpen(false)}>
          <div className="cmd-palette" onClick={(e) => e.stopPropagation()}>
            <div className="cmd-input-row">
              <Search size={16} strokeWidth={2} className="cmd-input-icon" />
              <input
                autoFocus
                className="cmd-input"
                placeholder="Search docs or run a command…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd className="cmd-kbd">esc</kbd>
            </div>
            <div className="cmd-results">
              <p className="cmd-group-label">Pages</p>
              {filtered.map((p) => (
                <button key={p.title} className="cmd-result">
                  <FileText size={15} strokeWidth={1.75} />
                  <span>{p.title}</span>
                  <span className="cmd-result-meta">{p.group}</span>
                  <CornerDownLeft size={13} className="cmd-result-enter" />
                </button>
              ))}
              {filtered.length === 0 && <p className="cmd-empty">No pages match “{query}”.</p>}

              <p className="cmd-group-label">Agent files</p>
              {sampleAgentLinks.map((l) => (
                <button key={l.title} className="cmd-result">
                  <Hash size={15} strokeWidth={1.75} />
                  <span>{l.title}</span>
                </button>
              ))}

              <p className="cmd-group-label">Commands</p>
              <button className="cmd-result">
                <Terminal size={15} strokeWidth={1.75} />
                <span>Toggle theme</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
