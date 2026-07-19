import 'server-only'

import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import { rehypeShiki } from '@/lib/rehype-shiki'
import { rehypeFixLinks } from '@/lib/rehype-fix-links'


function stripBody(content: string): string {
  if (content.trimStart().startsWith('---')) {
    const { content: parsed } = matter(content)
    return parsed
  }
  return content
}

export async function renderMarkdownToHtml(content: string): Promise<string> {
  const body = stripBody(content)

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeShiki)
    .use(rehypeFixLinks)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(body)

  return String(file)
}