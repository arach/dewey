import { notFound } from 'next/navigation'
import { renderMarkdownToHtml } from '@/lib/render-markdown'
import { extractHeadings } from '@/lib/headings'
import { templates, getTemplate, type TocEntry } from '@/lib/templates'
import { sampleMarkdown, sampleTitle, sampleDescription } from '@/lib/sample-doc'
import { HudsonTemplate } from '@/components/templates/HudsonTemplate'
import { RailTemplate } from '@/components/templates/RailTemplate'
import { CenteredTemplate } from '@/components/templates/CenteredTemplate'
import { CommandTemplate } from '@/components/templates/CommandTemplate'
import '@/styles/templates/_prose.css'
import '@/styles/templates/hudson.css'
import '@/styles/templates/rail.css'
import '@/styles/templates/centered.css'
import '@/styles/templates/command.css'

interface PageProps {
  params: Promise<{ name: string }>
}

export function generateStaticParams() {
  return templates.map((t) => ({ name: t.name }))
}

export async function generateMetadata({ params }: PageProps) {
  const { name } = await params
  const meta = getTemplate(name)
  return {
    title: meta ? `${meta.displayName} template — Dewey` : 'Template — Dewey',
    description: meta?.description,
  }
}

const COMPONENTS = {
  hudson: HudsonTemplate,
  rail: RailTemplate,
  centered: CenteredTemplate,
  command: CommandTemplate,
} as const

export default async function TemplatePreviewPage({ params }: PageProps) {
  const { name } = await params
  const meta = getTemplate(name)
  const Component = COMPONENTS[name as keyof typeof COMPONENTS]
  if (!meta || !Component) notFound()

  const contentHtml = await renderMarkdownToHtml(sampleMarkdown)
  const toc: TocEntry[] = extractHeadings(sampleMarkdown)

  return (
    <Component
      contentHtml={contentHtml}
      title={sampleTitle}
      description={sampleDescription}
      toc={toc}
    />
  )
}
