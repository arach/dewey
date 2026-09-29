'use client'

import { useCallback, useState } from 'react'

export function DocsNavToggle() {
  const [open, setOpen] = useState(false)

  const toggle = useCallback(() => {
    const root = document.querySelector('.dl')
    const next = !root?.classList.contains('dl-nav-open')
    root?.classList.toggle('dl-nav-open', next)
    setOpen(next)
  }, [])

  return (
    <button
      type="button"
      className="dl-nav-toggle"
      aria-label={open ? 'Close navigation' : 'Open navigation'}
      aria-expanded={open}
      aria-controls="dl-sidebar"
      onClick={toggle}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="17" x2="14" y2="17" />
      </svg>
    </button>
  )
}
