'use client'

import { useEffect, useState } from 'react'

// Toggles the `data-theme` on the closest `[data-template]` wrapper so each
// preview switches light/dark independently of the surrounding site chrome.
export function TemplateThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = document.querySelector('[data-template]') as HTMLElement | null
    if (root) setTheme((root.getAttribute('data-theme') as 'light' | 'dark') || 'light')
  }, [])

  const toggle = () => {
    const root = document.querySelector('[data-template]') as HTMLElement | null
    if (!root) return
    const next = (root.getAttribute('data-theme') || 'light') === 'dark' ? 'light' : 'dark'
    root.setAttribute('data-theme', next)
    setTheme(next)
  }

  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
    </button>
  )
}
