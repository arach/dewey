import { notFound } from 'next/navigation'
import { CREATE_TEMPLATE_SPECS } from '@deweydocs/dewey/registry'
import {
  galleryStaticParams,
  getEntry,
  getDocsAppLayout,
  type ThemeId,
} from '@/lib/templates'
import { ThemePreviewClient } from '@/components/templates/ThemePreviewClient'
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

export default async function TemplatePreviewPage({ params }: PageProps) {
  const { name } = await params
  const entry = getEntry(name)
  if (!entry) notFound()

  // Templates render through the same DocsApp preview as themes —
  // template = layout spec + skin over a default theme.
  const themeId: ThemeId =
    entry.kind === 'template'
      ? CREATE_TEMPLATE_SPECS[entry.id].defaultTheme
      : (entry.id as ThemeId)

  return (
    <ThemePreviewClient
      themeId={themeId}
      layoutConfig={getDocsAppLayout(entry)}
      fontUrls={entry.fonts?.cssUrls}
      skin={entry.kind === 'template' ? entry.layout.skin : undefined}
      slug={entry.id}
    />
  )
}
