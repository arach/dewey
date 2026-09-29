'use client'

import dynamic from 'next/dynamic'
import type { DocsAppLayoutConfig } from '@/lib/templates'
import type { ThemeId } from '@arach/dewey/registry'

const DocsAppThemePreview = dynamic(
  () =>
    import('./DocsAppThemePreview').then((mod) => mod.DocsAppThemePreview),
  { ssr: false },
)

export function ThemePreviewClient({
  themeId,
  layoutConfig,
  fontUrls,
  skin,
  slug,
}: {
  themeId: ThemeId
  layoutConfig: DocsAppLayoutConfig
  fontUrls?: string[]
  skin?: string
  slug?: string
}) {
  return (
    <DocsAppThemePreview
      themeId={themeId}
      layoutConfig={layoutConfig}
      fontUrls={fontUrls}
      skin={skin}
      slug={slug}
    />
  )
}
