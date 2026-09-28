'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navGroups } from '@/lib/nav'
import { ThemeToggle } from '@/components/ThemeToggle'

function titleCase(slug: string): string {
  const base = slug.split('/').pop() ?? slug
  return base
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

export function DocsTopbar() {
  const pathname = usePathname().replace(/\/$/, '') || '/'
  const slug = pathname.replace(/^\/docs\/?/, '')
  const item = slug
    ? navGroups.flatMap((g) => g.items).find((i) => i.href === pathname)
    : undefined
  const title = slug ? (item?.title ?? titleCase(slug)) : 'Documentation'
  const editHref = slug
    ? `https://github.com/arach/dewey/edit/main/www/docs/${slug}.md`
    : undefined

  return (
    <div className="dl-topbar">
      <div className="dl-topbar-left">
        <Link href="/docs" className="dl-topbar-crumb">
          Docs
        </Link>
        {slug && (
          <>
            <span className="dl-topbar-sep">/</span>
            <span className="dl-topbar-current">{title}</span>
          </>
        )}
      </div>
      <div className="dl-topbar-actions">
        {editHref && (
          <a
            href={editHref}
            className="dl-topbar-edit"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Edit page
          </a>
        )}
        <a
          href="https://github.com/arach/dewey"
          className="dl-topbar-icon"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
        <ThemeToggle />
      </div>
    </div>
  )
}
