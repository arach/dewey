'use client'

import { useState, type ReactNode } from 'react'

export function HudsonNavSection({
  title,
  bordered,
  children,
}: {
  title: string
  bordered?: boolean
  children: ReactNode
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className={`hudson-nav-section${bordered ? ' hudson-nav-section--bordered' : ''}`}>
      <button
        type="button"
        className="hudson-nav-label"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        {title}
        <svg
          className="hudson-nav-chevron"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div data-nav-list data-collapsed={expanded ? undefined : 'true'}>
        {children}
      </div>
    </div>
  )
}