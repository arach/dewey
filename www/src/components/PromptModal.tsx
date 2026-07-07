'use client'

import { useEffect, useState } from 'react'

export function PromptModal({
  title,
  prompt,
}: {
  title: string
  prompt: string
}) {
  const [open, setOpen] = useState(false)
  const [copyLabel, setCopyLabel] = useState('Copy Prompt')

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopyLabel('Copied!')
      setTimeout(() => setCopyLabel('Copy Prompt'), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <>
      <button
        type="button"
        className="dl-action-btn accent"
        onClick={() => setOpen(true)}
      >
        AI Prompt
      </button>

      {open && (
        <div
          className="dl-prompt-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <div className="dl-prompt-dialog" role="dialog" aria-modal="true" aria-labelledby="dl-prompt-title">
            <div className="dl-prompt-header">
              <div>
                <p className="dl-prompt-label">AI Prompt</p>
                <h2 id="dl-prompt-title" className="dl-prompt-title">{title}</h2>
              </div>
              <button type="button" className="dl-action-btn" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div className="dl-prompt-body">
              <pre className="dl-prompt-content">{prompt}</pre>
            </div>
            <div className="dl-prompt-footer">
              <button type="button" className="dl-action-btn" onClick={copy}>
                {copyLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}