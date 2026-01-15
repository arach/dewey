import { useState, useEffect } from 'react'
import { useDewey } from './DeweyProvider'

// ============================================
// Types
// ============================================

export interface TocItem {
  /** Element ID for anchor link */
  id: string
  /** Heading text */
  title: string
  /** Heading level (2 = h2, 3 = h3, etc.) */
  level: number
}

export interface TableOfContentsProps {
  /** Table of contents items */
  items?: TocItem[]
  /** Title above the TOC */
  title?: string
  /** CSS class name */
  className?: string
  /** Offset from top for scroll spy (pixels) */
  scrollOffset?: number
}

// ============================================
// Scroll Spy Hook
// ============================================

/**
 * Hook to track which section is currently in view
 */
export function useActiveSection(items: TocItem[], offset = 100): string {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (typeof window === 'undefined' || items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible section
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          // Get the one closest to the top
          const sorted = visible.sort((a, b) =>
            a.boundingClientRect.top - b.boundingClientRect.top
          )
          setActiveId(sorted[0].target.id)
        }
      },
      {
        rootMargin: `-${offset}px 0px -66% 0px`,
        threshold: 0,
      }
    )

    // Observe all section headings
    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [items, offset])

  return activeId
}

// ============================================
// Extract Sections from Markdown
// ============================================

/**
 * Extract TOC items from markdown content
 */
export function extractTocItems(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm
  const items: TocItem[] = []
  let match

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const title = match[2].trim()
    // Create slug from title
    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')

    items.push({ id, title, level })
  }

  return items
}

/**
 * Extract TOC items from rendered DOM
 */
export function extractTocFromDom(container: HTMLElement): TocItem[] {
  const headings = container.querySelectorAll('h2, h3, h4')
  const items: TocItem[] = []

  headings.forEach((heading) => {
    if (heading.id) {
      items.push({
        id: heading.id,
        title: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1), 10),
      })
    }
  })

  return items
}

// ============================================
// Main Component
// ============================================

export function TableOfContents({
  items = [],
  title = 'On this page',
  className = '',
  scrollOffset = 100,
}: TableOfContentsProps) {
  const { isDark } = useDewey()
  const activeId = useActiveSection(items, scrollOffset)

  // Don't render if no items
  if (items.length === 0) {
    return null
  }

  return (
    <aside className={`dw-toc ${className}`} data-dark={isDark}>
      <h4 className="dw-toc-title">{title}</h4>
      <nav>
        <ul className="dw-toc-list">
          {items.map((item) => (
            <li key={item.id} className="dw-toc-item">
              <a
                href={`#${item.id}`}
                className={`dw-toc-link ${activeId === item.id ? 'active' : ''}`}
                data-level={item.level}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

// ============================================
// Auto-generating TOC Component
// ============================================

interface AutoTocProps {
  /** Markdown content to extract headings from */
  markdown?: string
  /** Container ref to extract headings from DOM */
  containerRef?: React.RefObject<HTMLElement>
  /** Title above the TOC */
  title?: string
  /** CSS class name */
  className?: string
}

export function AutoTableOfContents({
  markdown,
  containerRef,
  title = 'On this page',
  className = '',
}: AutoTocProps) {
  const [items, setItems] = useState<TocItem[]>([])

  // Extract from markdown on mount
  useEffect(() => {
    if (markdown) {
      setItems(extractTocItems(markdown))
    } else if (containerRef?.current) {
      setItems(extractTocFromDom(containerRef.current))
    }
  }, [markdown, containerRef])

  return (
    <TableOfContents items={items} title={title} className={className} />
  )
}

export default TableOfContents
