'use client'

import { useEffect, useState } from 'react'
import type { DocHeading } from '@/lib/headings'

export function DocToc({ headings }: { headings: DocHeading[] }) {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    if (headings.length === 0) return

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[]

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-80px 0px -66% 0px' },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <aside className="dl-toc">
      <p className="dl-toc-label">On this page</p>
      <ul className="dl-toc-list">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`dl-toc-link${activeId === heading.id ? ' is-active' : ''}`}
              data-level={heading.depth}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}