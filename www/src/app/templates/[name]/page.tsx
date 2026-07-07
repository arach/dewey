import { notFound } from 'next/navigation'
import { renderMarkdownToHtml } from '@/lib/render-markdown'
import { extractHeadings } from '@/lib/headings'
import {
  galleryStaticParams,
  getEntry,
  getDocsAppLayout,
  getThemeEntry,
  type TocEntry,
  type ThemeId,
} from '@/lib/templates'
import { sampleMarkdown, sampleTitle, sampleDescription } from '@/lib/preview-content'
import { HudsonTemplate } from '@/components/templates/HudsonTemplate'
import { RailTemplate } from '@/components/templates/RailTemplate'
import { CenteredTemplate } from '@/components/templates/CenteredTemplate'
import { CommandTemplate } from '@/components/templates/CommandTemplate'
import { DocsAppThemePreview } from '@/components/templates/DocsAppThemePreview'
import '@/styles/templates/_prose.css'
import '@/styles/templates/hudson.css'
import '@/styles/templates/rail.css'
import '@/styles/templates/centered.css'
import '@/styles/templates/command.css'
import '@/styles/templates/theme-preview.css'

interface PageProps {
  params: Promise<{ name: string }>
}

export function generateStaticParams() {
  return galleryStaticParams()
}

export async function generateMetadata({ params }: PageProps) {
  const { name } = await params
  const entry = getEntry(name)
  return {
    title: entry ? `${entry.label} — Dewey` : 'Template — Dewey',
    description: entry?.description,
  }
}

const STANDALONE = {
  hudson: HudsonTemplate,
  rail: RailTemplate,
  centered: CenteredTemplate,
  command: CommandTemplate,
} as const

export default async function TemplatePreviewPage({ params }: PageProps) {
  const { name } = await params
  const entry = getEntry(name)
  if (!entry) notFound()

  const contentHtml = await renderMarkdownToHtml(sampleMarkdown)
  const toc: TocEntry[] = extractHeadings(sampleMarkdown)

  if (entry.kind === 'template') {
    const Standalone = STANDALONE[entry.id]
    if (!Standalone) notFound()
    return (
      <Standalone
        contentHtml={contentHtml}
        title={sampleTitle}
        description={sampleDescription}
        toc={toc}
      />
    )
  }

  const themeEntry = getThemeEntry(name)
  if (!themeEntry) notFound()

  return (
    <DocsAppThemePreview
      themeId={name as ThemeId}
      layoutConfig={getDocsAppLayout(themeEntry)}
      fontUrls={themeEntry.fonts?.cssUrls}
    />
  )
}