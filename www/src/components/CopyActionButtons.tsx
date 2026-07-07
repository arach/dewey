'use client'

import { useState, type ReactNode } from 'react'

const copyIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const markdownIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

function ActionButton({
  defaultLabel,
  icon,
  onCopy,
}: {
  defaultLabel: string
  icon: ReactNode
  onCopy: () => Promise<void>
}) {
  const [label, setLabel] = useState(defaultLabel)

  return (
    <button
      type="button"
      className="dl-action-btn"
      onClick={async () => {
        await onCopy()
        setLabel('Copied!')
        setTimeout(() => setLabel(defaultLabel), 2000)
      }}
    >
      {icon}
      {label}
    </button>
  )
}

export function CopyActionButtons({
  markdownContent,
  agentContent,
}: {
  markdownContent: string
  agentContent?: string
}) {
  const copy = async (text: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
  }

  return (
    <>
      <ActionButton
        defaultLabel="Copy for agent"
        icon={copyIcon}
        onCopy={() => copy(agentContent || markdownContent)}
      />
      <ActionButton
        defaultLabel="Copy markdown"
        icon={markdownIcon}
        onCopy={() => copy(markdownContent)}
      />
    </>
  )
}