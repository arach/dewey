'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function Search() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)

  const loadPagefind = useCallback(async () => {
    if (loadedRef.current || !containerRef.current) return
    loadedRef.current = true

    try {
      // Load Pagefind UI CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/pagefind/pagefind-ui.css'
      document.head.appendChild(link)

      // Load and initialize Pagefind UI
      // @ts-expect-error — pagefind-ui.js is generated at build time by postbuild
      const mod = await import(/* webpackIgnore: true */ '/pagefind/pagefind-ui.js')
      const PagefindUI = mod.PagefindUI || mod.default
      new PagefindUI({
        element: containerRef.current,
        showSubResults: true,
        showImages: false,
      })

      // Focus the search input
      setTimeout(() => {
        const input = containerRef.current?.querySelector<HTMLInputElement>('input')
        input?.focus()
      }, 100)
    } catch {
      // Pagefind not built yet — show hint
      if (containerRef.current) {
        containerRef.current.innerHTML =
          '<p style="padding:1rem;color:var(--dw-muted-foreground);font-size:0.875rem;">Search index not found. Run <code>npm run build</code> to generate it.</p>'
      }
    }
  }, [])

  useEffect(() => {
    if (open) loadPagefind()
  }, [open, loadPagefind])

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.375rem 0.75rem',
          borderRadius: '0.5rem',
          fontSize: '0.8125rem',
          color: 'var(--dw-muted-foreground)',
          background: 'var(--dw-muted)',
          border: '1px solid var(--dw-border)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        Search…
        <kbd style={{ fontSize: '0.6875rem', opacity: 0.6, marginLeft: '0.25rem' }}>⌘K</kbd>
      </button>
      {open && (
        <div className="search-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="search-modal">
            <div ref={containerRef} />
          </div>
        </div>
      )}
    </>
  )
}
