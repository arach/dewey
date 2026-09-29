// Minimal hast-compatible types — avoids depending on the `hast` package.

interface HastNode {
  type: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
  [key: string]: unknown
}

interface HastRoot {
  type: 'root'
  children: HastNode[]
  [key: string]: unknown
}

function isHeading(node: HastNode): boolean {
  return node.type === 'element' && (node.tagName === 'h1' || node.tagName === 'h2')
}

function isCodeBlock(node: HastNode): boolean {
  return node.type === 'element' && node.tagName === 'pre'
}

function div(children: HastNode[], className: string): HastNode {
  return {
    type: 'element',
    tagName: 'div',
    properties: { className: [className] },
    children,
  }
}

/**
 * Splits rendered markdown into per-section two-column rows: prose on the
 * left, code blocks lifted into a dark right rail — API-reference layout.
 * Sections break on h1/h2; the preamble becomes the first section.
 */
export function rehypeDwSplit() {
  return (tree: HastRoot) => {
    const sections: { main: HastNode[]; rail: HastNode[] }[] = []
    let current: { main: HastNode[]; rail: HastNode[] } = { main: [], rail: [] }

    for (const node of tree.children) {
      if (isHeading(node) && (current.main.length > 0 || current.rail.length > 0)) {
        sections.push(current)
        current = { main: [], rail: [] }
      }
      if (isCodeBlock(node)) current.rail.push(node)
      else current.main.push(node)
    }
    if (current.main.length > 0 || current.rail.length > 0) sections.push(current)

    tree.children = [
      div(
        sections.map((s) =>
          div(
            [
              div(s.main, 'dw-split-main'),
              ...(s.rail.length > 0 ? [div(s.rail, 'dw-split-rail')] : []),
            ],
            'dw-split-section',
          ),
        ),
        'dw-split',
      ),
    ]
  }
}
