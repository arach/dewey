'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

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

const externalIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

const chevronIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export function DocContextMenu({
  slug,
  markdownContent,
  agentContent,
}: {
  slug: string
  markdownContent: string
  agentContent?: string
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const copy = async (text: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const markdownUrl = () => `${window.location.origin}/docs/${slug}.md`
  const promptFor = () =>
    encodeURIComponent(`Read ${markdownUrl()} so you can answer questions about it.`)

  const externalTargets: { label: string; href: () => string }[] = [
    { label: 'Open in ChatGPT', href: () => `https://chatgpt.com/?q=${promptFor()}` },
    { label: 'Open in Claude', href: () => `https://claude.ai/new?q=${promptFor()}` },
    { label: 'Open in Perplexity', href: () => `https://www.perplexity.ai/search?q=${promptFor()}` },
  ]

  const menuItem = (icon: ReactNode, label: string, onClick: () => void) => (
    <button key={label} type="button" className="dl-ctx-item" onClick={onClick}>
      {icon}
      {label}
    </button>
  )

  return (
    <div className="dl-ctx" ref={rootRef}>
      <button
        type="button"
        className="dl-action-btn dl-ctx-primary"
        onClick={() => copy(agentContent || markdownContent)}
      >
        {copyIcon}
        {copied ? 'Copied!' : 'Copy page'}
      </button>
      <button
        type="button"
        className="dl-action-btn dl-ctx-toggle"
        aria-label="More actions"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {chevronIcon}
      </button>

      {open && (
        <div className="dl-ctx-menu" role="menu">
          {menuItem(copyIcon, 'Copy page for agent', async () => {
            await copy(agentContent || markdownContent)
            setOpen(false)
          })}
          {menuItem(markdownIcon, 'Copy as markdown', async () => {
            await copy(markdownContent)
            setOpen(false)
          })}
          <a
            className="dl-ctx-item"
            href={`/docs/${slug}.md`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            {markdownIcon}
            View as markdown
          </a>
          <div className="dl-ctx-sep" />
          {externalTargets.map((target) => (
            <a
              key={target.label}
              className="dl-ctx-item"
              href={target.href()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              {externalIcon}
              {target.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
