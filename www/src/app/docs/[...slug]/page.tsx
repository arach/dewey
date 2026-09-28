import Link from 'next/link'
import { getDocBySlug, getAllDocSlugs } from '@/lib/docs'
import { getPageSequence } from '@/lib/navigation'
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

  const sequence = getPageSequence()
  const index = sequence.findIndex((item) => item.id === slugStr)
  const prev = index > 0 ? sequence[index - 1] : undefined
  const next = index >= 0 && index < sequence.length - 1 ? sequence[index + 1] : undefined

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
          slug={slugStr}
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
          <nav className="dl-pagenav" aria-label="Pagination">
            {prev ? (
              <Link className="dl-pagenav-link" href={`/docs/${prev.id}`}>
                <span className="dl-pagenav-dir">&larr; Previous</span>
                <span className="dl-pagenav-title">{prev.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link className="dl-pagenav-link dl-pagenav-next" href={`/docs/${next.id}`}>
                <span className="dl-pagenav-dir">Next &rarr;</span>
                <span className="dl-pagenav-title">{next.title}</span>
              </Link>
            ) : <span />}
          </nav>
          <span className="dl-footer-text">
            <Link href="/">dewey</Link> &mdash; agent-ready documentation
          </span>
        </footer>
      </article>

      <DocToc headings={headings} />
    </div>
  )
}