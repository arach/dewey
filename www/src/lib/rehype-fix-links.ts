import type { Root } from 'hast'
import { visit } from 'unist-util-visit'

export function rehypeFixLinks() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return

      const href = node.properties?.href
      if (typeof href !== 'string') return

      if (!href.startsWith('http') && href.endsWith('.md')) {
        node.properties.href = href.replace(/\.md$/, '')
      }

      if (href.startsWith('http')) {
        node.properties.target = '_blank'
        node.properties.rel = 'noopener noreferrer'
      }
    })
  }
}