'use client'

import { DocContextMenu } from '@/components/DocContextMenu'
import { PromptModal } from '@/components/PromptModal'

export function DocPageActions({
  title,
  slug,
  rawMarkdown,
  agentContent,
  isPrompt,
}: {
  title: string
  slug: string
  rawMarkdown: string
  agentContent?: string
  isPrompt?: boolean
}) {
  return (
    <div className="dl-page-actions">
      <DocContextMenu
        slug={slug}
        markdownContent={rawMarkdown}
        agentContent={agentContent}
      />
      {isPrompt && (
        <PromptModal title={title} prompt={rawMarkdown} />
      )}
    </div>
  )
}
