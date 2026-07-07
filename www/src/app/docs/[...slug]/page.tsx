import Link from 'next/link'
import { getDocBySlug, getAllDocSlugs } from '@/lib/docs'
import { extractHeadings, stripLeadHeading } from '@/lib/headings'
import { ProdMarkdownContent } from '@/components/ProdMarkdownContent'
import { CodeCopyInit } from '@/components/CodeCopyInit'
import { DocPageActions } from '@/components/DocPageActions'
import { DocToc } from '@/components/DocToc'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs()
  return slugs.map((slug) => ({ slug: slug.split('/') }))
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params
  const slugStr = slug.join('/')
  const doc = getDocBySlug(slugStr)

  if (!doc) {
    return <div>Page not found</div>
  }

  const renderedContent = stripLeadHeading(doc.content)
  const headings = extractHeadings(renderedContent)

  return (
    <div className="dl-content-wrap">
      <div className="dl-page-header">
        <div className="dl-page-header-text">
          {doc.isPrompt && <div className="dl-page-badge">Prompt</div>}
          <h1 className="dl-page-title">{doc.title}</h1>
          {doc.description && <p className="dl-page-desc">{doc.description}</p>}
        </div>
        <DocPageActions
          title={doc.title}
          rawMarkdown={doc.rawMarkdown}
          agentContent={doc.agentContent}
          isPrompt={doc.isPrompt}
        />
      </div>

      <article className="dl-content">
        <div className={`doc-content${doc.isPrompt ? ' doc-content-prompt' : ''}`}>
          <ProdMarkdownContent content={renderedContent} />
          <CodeCopyInit />
        </div>
        <footer className="dl-footer">
          <span className="dl-footer-text">
            <Link href="/">dewey</Link> &mdash; agent-ready documentation
          </span>
        </footer>
      </article>

      <DocToc headings={headings} />
    </div>
  )
}