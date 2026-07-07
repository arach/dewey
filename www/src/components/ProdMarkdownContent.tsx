import 'server-only'

import { renderMarkdownToHtml } from '@/lib/render-markdown'

interface ProdMarkdownContentProps {
  content: string
}

export async function ProdMarkdownContent({ content }: ProdMarkdownContentProps) {
  const html = await renderMarkdownToHtml(content)

  return <div className="doc-markdown" dangerouslySetInnerHTML={{ __html: html }} />
}