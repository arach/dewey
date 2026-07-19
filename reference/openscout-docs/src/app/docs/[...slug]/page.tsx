import { notFound } from 'next/navigation'
import { getAllDocs, getDocBySlug, getNavigation } from '@/lib/dewey-docs'
import { compileMDX, extractHeadings, stripLeadHeading } from '@/lib/mdx'
import { ArcDiagram } from '@/components/ArcDiagram'
import { StateFlow } from '@/components/docs/StateFlow'
import { DocView } from './content'

const mdxComponents = { StateFlow, ArcDiagram }

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.slug.split('/') }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const doc = getDocBySlug(slug.join('/'))
  if (!doc) return {}
  return {
    title: `${doc.title} — Scout Docs`,
    description: doc.description,
  }
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params
  const slugStr = slug.join('/')
  const doc = getDocBySlug(slugStr)
  if (!doc) notFound()

  const navigation = getNavigation()
  const allDocs = getAllDocs()
  const idx = allDocs.findIndex((d) => d.slug === slugStr)
  const prevPage = idx > 0
    ? { id: allDocs[idx - 1].slug, title: allDocs[idx - 1].title }
    : undefined
  const nextPage = idx < allDocs.length - 1
    ? { id: allDocs[idx + 1].slug, title: allDocs[idx + 1].title }
    : undefined

  const cleanContent = stripLeadHeading(doc.content)
  const headings = extractHeadings(cleanContent)

  const MDXContent = await compileMDX(cleanContent)

  let agentMDX: React.ReactNode = null
  if (doc.agentContent) {
    const AgentContent = await compileMDX(stripLeadHeading(doc.agentContent))
    agentMDX = <AgentContent components={mdxComponents} />
  }

  return (
    <DocView
      title={doc.title}
      description={doc.description}
      headings={headings}
      navigation={navigation}
      slug={slugStr}
      prevPage={prevPage}
      nextPage={nextPage}
      projectName="Scout"
      basePath="/docs"
      hasAgentContent={!!doc.agentContent}
      agentMDX={agentMDX}
      rawContent={cleanContent}
      rawAgentContent={doc.agentContent}
    >
      <MDXContent components={mdxComponents} />
    </DocView>
  )
}