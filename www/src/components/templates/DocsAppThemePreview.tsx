'use client'

import { useEffect, useState } from 'react'
import { DocsApp, type ThemeId } from '@arach/dewey'
import type { DocsAppLayoutConfig } from '@/lib/templates'
import { previewDataset, sampleDocs, previewDocsAppConfig } from '@/lib/preview-content'
import '@arach/dewey/css/tokens'
import '@arach/dewey/css/base.css'

const THEME_CSS: Record<ThemeId, () => Promise<unknown>> = {
  neutral: () => import('@arach/dewey/css/colors/neutral.css'),
  ocean: () => import('@arach/dewey/css/colors/ocean.css'),
  emerald: () => import('@arach/dewey/css/colors/emerald.css'),
  purple: () => import('@arach/dewey/css/colors/purple.css'),
  dusk: () => import('@arach/dewey/css/colors/dusk.css'),
  rose: () => import('@arach/dewey/css/colors/rose.css'),
  github: () => import('@arach/dewey/css/colors/github.css'),
  warm: () => import('@arach/dewey/css/colors/warm.css'),
  midnight: () => import('@arach/dewey/css/colors/midnight.css'),
  mono: () => import('@arach/dewey/css/colors/mono.css'),
}

export function DocsAppThemePreview({
  themeId,
  layoutConfig,
  fontUrls = [],
}: {
  themeId: ThemeId
  layoutConfig: DocsAppLayoutConfig
  fontUrls?: string[]
}) {
  const [currentPage, setCurrentPage] = useState(previewDataset.activePageId)
  const basePath = `/templates/${themeId}`

  useEffect(() => {
    void THEME_CSS[themeId]?.()
  }, [themeId])

  useEffect(() => {
    for (const url of fontUrls) {
      if (document.querySelector(`link[data-preview-font="${url}"]`)) continue
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = url
      link.setAttribute('data-preview-font', url)
      document.head.appendChild(link)
    }
  }, [fontUrls])

  return (
    <div className="theme-docs-app-preview" data-theme-preview={themeId}>
      <header className="theme-preview-bar">
        <a href="/templates" className="theme-preview-back">
          ← Templates
        </a>
        <span className="theme-preview-name">{themeId}</span>
      </header>
      <DocsApp
        config={{
          ...previewDocsAppConfig(basePath),
          layout: layoutConfig,
        }}
        docs={sampleDocs}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        providerProps={{
          theme: themeId,
          storageKey: `dewey-preview-${themeId}-dark`,
          components: {
            Link: ({ href, children, ...props }) => {
              const handleClick = (e: React.MouseEvent) => {
                e.preventDefault()
                if (href?.startsWith(`${basePath}/`)) {
                  const pageId = href.slice(`${basePath}/`.length)
                  if (pageId && sampleDocs[pageId]) setCurrentPage(pageId)
                } else if (href === basePath) {
                  setCurrentPage(previewDataset.activePageId)
                } else if (href === '/templates') {
                  window.location.href = '/templates'
                }
              }
              return (
                <a href={href} onClick={handleClick} {...props}>
                  {children}
                </a>
              )
            },
          },
        }}
      />
    </div>
  )
}