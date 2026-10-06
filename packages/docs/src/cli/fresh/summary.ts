// One-line summary for llms.txt entries: the description, else the first prose block, list or heading.
function cleanSummaryMarkdown(value: string): string {
  return value
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+[.)]\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[\*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractLlmsSummary(doc: { description?: string; content: string; title: string }): string {
  if (doc.description?.trim()) return cleanSummaryMarkdown(doc.description).slice(0, 320)

  const content = doc.content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<!--([\s\S]*?)-->/g, '')
    .trim()

  const summaryContent = content.replace(/^#{1,6}\s+.*$/gm, '').trim()
  const blocks = summaryContent.split(/\n{2,}/).map(block => block.trim()).filter(Boolean)
  const prose = blocks.find(block =>
    !block.startsWith('#') &&
    !block.startsWith('|') &&
    !/^[-*+]\s+/.test(block) &&
    !/^\d+[.)]\s+/.test(block),
  )
  if (prose) return cleanSummaryMarkdown(prose).slice(0, 320)

  const list = blocks.find(block => /^([-*+]\s+|\d+[.)]\s+)/.test(block))
  if (list) {
    const items = list.split('\n').filter(line => /^\s*([-*+]\s+|\d+[.)]\s+)/.test(line)).slice(0, 3)
    const summary = items.map(cleanSummaryMarkdown).filter(Boolean).join('; ')
    if (summary) return summary.slice(0, 320)
  }

  const heading = content.match(/^#{1,6}\s+(.+)$/m)?.[1]
  return cleanSummaryMarkdown(heading || doc.title).slice(0, 320)
}
