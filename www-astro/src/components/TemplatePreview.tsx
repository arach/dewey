import { useState } from 'react'
import { DocsApp } from '../../../packages/docs/src/components/DocsApp'
import { sampleDocs, sampleConfig } from '../data/sample-content'
import type { LayoutConfigResult } from '../data/templates'

interface TemplatePreviewProps {
  template: string
  layoutConfig?: LayoutConfigResult['layoutConfig']
}

export function TemplatePreview({ template, layoutConfig }: TemplatePreviewProps) {
  const [currentPage, setCurrentPage] = useState('getting-started')

  return (
    <DocsApp
      config={{
        ...sampleConfig,
        basePath: `/templates/${template}`,
        homeUrl: '/templates',
        ...(layoutConfig && { layout: layoutConfig }),
      }}
      docs={sampleDocs}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      providerProps={{
        theme: template as any,
        storageKey: `dewey-preview-${template}-dark`,
        components: {
          Link: ({ href, children, ...props }) => {
            const handleClick = (e: React.MouseEvent) => {
              e.preventDefault()
              const basePath = `/templates/${template}/`
              if (href?.startsWith(basePath)) {
                const pageId = href.slice(basePath.length)
                if (pageId && sampleDocs[pageId]) {
                  setCurrentPage(pageId)
                }
              } else if (href === `/templates/${template}`) {
                setCurrentPage('index')
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
  )
}
