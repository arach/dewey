'use client'

import { CopyActionButtons } from '@/components/CopyActionButtons'
import { PromptModal } from '@/components/PromptModal'

export function DocPageActions({
  title,
  rawMarkdown,
  agentContent,
  isPrompt,
}: {
  title: string
  rawMarkdown: string
  agentContent?: string
  isPrompt?: boolean
}) {
  return (
    <div className="dl-page-actions">
      <CopyActionButtons
        markdownContent={rawMarkdown}
        agentContent={agentContent}
      />
      {isPrompt && (
        <PromptModal title={title} prompt={rawMarkdown} />
      )}
    </div>
  )
}