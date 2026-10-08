import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import type { Options } from 'react-markdown'

// Raw HTML in Markdown (a centered README hero, <br>, <img>) renders the way GitHub shows it:
// parsed, then sanitized with GitHub's allow-list. Ids keep their names so heading anchors work.
const schema = {
  ...defaultSchema,
  clobberPrefix: '',
  attributes: { ...defaultSchema.attributes, '*': [...(defaultSchema.attributes?.['*'] ?? []), 'align'] },
}

interface HastNode {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

const ALERTS: Record<string, string> = { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution' }

// GitHub alerts: a blockquote opening with [!NOTE], [!TIP], [!IMPORTANT], [!WARNING] or [!CAUTION].
function rehypeAlerts() {
  const visit = (node: HastNode) => {
    node.children?.forEach(visit)
    if (node.type !== 'element' || node.tagName !== 'blockquote') return
    const paragraph = node.children?.find(child => child.type === 'element')
    const text = paragraph?.tagName === 'p' ? paragraph.children?.[0] : undefined
    const match = text?.type === 'text' ? text.value?.match(/^\s*\[!(note|tip|important|warning|caution)\][ \t]*\n?/i) : null
    if (!paragraph || !text || !match) return
    const kind = match[1].toLowerCase()
    text.value = text.value!.slice(match[0].length)
    if (!text.value) paragraph.children!.shift()
    if (!paragraph.children!.length) node.children = node.children!.filter(child => child !== paragraph)
    node.properties = { ...node.properties, className: ['dw-markdown-alert', `dw-markdown-alert-${kind}`] }
    node.children!.unshift({ type: 'element', tagName: 'p', properties: { className: ['dw-markdown-alert-title'] }, children: [{ type: 'text', value: ALERTS[kind] }] })
  }
  return (tree: HastNode) => visit(tree)
}

export const markdownRehype: NonNullable<Options['rehypePlugins']> = [rehypeRaw, [rehypeSanitize, schema], rehypeSlug, rehypeAlerts]
