export interface DocHeading {
  id: string
  text: string
  depth: 2 | 3
}

function cleanHeadingText(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .trim()
}

export function extractHeadings(content: string): DocHeading[] {
  const headings: DocHeading[] = []
  const seen = new Map<string, number>()

  for (const line of content.split('\n')) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    if (!match) continue

    const text = cleanHeadingText(match[2])
    if (!text) continue

    const depth = match[1].length as 2 | 3
    let base = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    const id = count === 0 ? base : `${base}-${count}`

    headings.push({ id, text, depth })
  }

  return headings
}

export function stripLeadHeading(content: string): string {
  return content.replace(/^\s*#\s+.+\n+/, '')
}