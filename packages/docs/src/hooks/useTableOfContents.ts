import { useState, useEffect } from 'react'
import type { DocSection } from '../types'

/**
 * Extract sections from markdown content for table of contents
 */
export function extractSections(markdown: string): DocSection[] {
  const sections: DocSection[] = []
  const lines = markdown.split('\n')

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/)
    const h3Match = line.match(/^### (.+)$/)

    if (h2Match) {
      const title = h2Match[1].trim()
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      sections.push({ id, title, level: 2 })
    } else if (h3Match) {
      const title = h3Match[1].trim()
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      sections.push({ id, title, level: 3 })
    }
  }

  return sections
}

/**
 * Hook for tracking active section in table of contents
 */
export function useTableOfContents(sections: DocSection[]) {
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -66% 0px' }
    )

    sections.forEach((section) => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  return activeSection
}

export default useTableOfContents
