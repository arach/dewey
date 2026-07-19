import { evaluate } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'

export type Heading = { id: string; title: string; depth: 2 | 3 }

export async function compileMDX(source: string) {
  const { default: MDXContent } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  })
  return MDXContent
}

export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = []
  const seen = new Map<string, number>()

  for (const line of content.split('\n')) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    if (!match) continue

    const title = match[2]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .trim()

    if (!title) continue

    const base = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    const id = count === 0 ? base : `${base}-${count}`

    headings.push({ id, title, depth: match[1].length as 2 | 3 })
  }

  return headings
}

export function stripLeadHeading(content: string): string {
  return content.replace(/^\s*#\s+.+\n+/, '')
}
