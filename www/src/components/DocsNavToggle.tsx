'use client'

export function DocsNavToggle() {
  return (
    <button
      type="button"
      className="dl-nav-toggle"
      aria-label="Open navigation"
      onClick={() => document.querySelector('.dl')?.classList.add('dl-nav-open')}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="17" x2="14" y2="17" />
      </svg>
    </button>
  )
}
