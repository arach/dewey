'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function Search({
  className,
  label = 'Search docs',
}: {
  className?: string
  label?: string
}) {
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

      // Load and initialize Pagefind UI (IIFE attaches window.PagefindUI)
      // @ts-expect-error — pagefind-ui.js is generated at build time by postbuild
      await import(/* webpackIgnore: true */ '/pagefind/pagefind-ui.js')
      const PagefindUI = (window as { PagefindUI?: new (opts: object) => void }).PagefindUI
      if (!PagefindUI) throw new Error('PagefindUI not found')
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
          '<p style="padding:1rem;color:var(--color-text-muted);font-size:0.875rem;">Search index not found. Run <code>npm run build</code> to generate it.</p>'
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
        type="button"
        className={className ?? 'dl-search-btn'}
        onClick={() => setOpen(true)}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <span>{label}</span>
        <kbd className="search-kbd">⌘K</kbd>
      </button>
      {open && (
        <div className="search-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="search-modal" role="dialog" aria-label="Search documentation">
            <div ref={containerRef} />
          </div>
        </div>
      )}
    </>
  )
}
