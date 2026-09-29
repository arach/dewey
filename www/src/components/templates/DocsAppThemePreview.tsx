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

const SKIN_CSS: Record<string, () => Promise<unknown>> = {
  atlas: () => import('@arach/dewey/css/skins/atlas.css'),
  endpoint: () => import('@arach/dewey/css/skins/endpoint.css'),
  terminal: () => import('@arach/dewey/css/skins/terminal.css'),
}

export function DocsAppThemePreview({
  themeId,
  layoutConfig,
  fontUrls = [],
  skin,
  slug,
}: {
  themeId: ThemeId
  layoutConfig: DocsAppLayoutConfig
  fontUrls?: string[]
  /** Optional skin key — loads `css/skins/<skin>.css` and adds `dw-skin-<skin>` */
  skin?: string
  /** Preview slug for basePath (defaults to themeId) */
  slug?: string
}) {
  const [currentPage, setCurrentPage] = useState(previewDataset.activePageId)
  const basePath = `/templates/${slug ?? themeId}`

  useEffect(() => {
    void THEME_CSS[themeId]?.()
    if (skin) void SKIN_CSS[skin]?.()
  }, [themeId, skin])

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
    <div className="theme-docs-app-preview" data-theme-preview={slug ?? themeId}>
      <header className="theme-preview-bar">
        <a href="/templates" className="theme-preview-back">
          ← Templates
        </a>
        <span className="theme-preview-name">{slug ?? themeId}</span>
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
          storageKey: `dewey-preview-${slug ?? themeId}-dark`,
          components: {
            Link: ({ href, children, onClick, ...props }) => {
              const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                onClick?.(e)
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
