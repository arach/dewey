'use client'

import { useEffect, useState } from 'react'

// Hudson keeps data-template="hudson" and toggles light/dark via data-mode.
export function HudsonThemeToggle({ className }: { className?: string }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = document.querySelector('[data-template="hudson"]') as HTMLElement | null
    if (root) setMode(root.getAttribute('data-mode') === 'dark' ? 'dark' : 'light')
  }, [])

  const toggle = () => {
    const root = document.querySelector('[data-template="hudson"]') as HTMLElement | null
    if (!root) return
    const next = root.getAttribute('data-mode') === 'dark' ? 'light' : 'dark'
    if (next === 'light') root.removeAttribute('data-mode')
    else root.setAttribute('data-mode', 'dark')
    setMode(next)
  }

  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    </button>
  )
}