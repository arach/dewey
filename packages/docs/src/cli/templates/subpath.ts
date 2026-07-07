// ---------------------------------------------------------------------------
// Subpath template definitions
// Used by `dewey site init` to add /docs into an existing Next.js app.
// Generates ONLY docs-route files — never touches root layout, package.json,
// next.config, tailwind config, or any consumer-owned infrastructure.
// ---------------------------------------------------------------------------

// version import available for future template use
// import { DEWEY_VERSION } from '../version.js'

// ---------------------------------------------------------------------------
// Template arguments
// ---------------------------------------------------------------------------

export interface SubpathTemplateArgs {
  projectName: string
  basePath: string        // e.g. '/docs'
  docsDir: string         // relative to project root, e.g. '../docs' or './docs'
  defaultPage: string     // first page slug
}

// ---------------------------------------------------------------------------
// Templates — each key is a file path relative to the project root
// ---------------------------------------------------------------------------

export const SUBPATH_TEMPLATES: Record<string, (args: SubpathTemplateArgs) => string> = {

  // ── Docs layout (server component — just imports CSS) ─────────────────
  'src/app/docs/layout.tsx': () => `import './dewey-docs.css'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
`,

  // ── Docs index page ───────────────────────────────────────────────────
  'src/app/docs/page.tsx': (args) => `import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getNavigation } from '@/lib/dewey-docs'

export default function DocsIndex() {
  const navigation = getNavigation()
  const firstDoc = navigation[0]?.items[0]

  return (
    <div className="dewey-landing min-h-screen" style={{ background: 'var(--dewey-bg)', color: 'var(--dewey-fg)' }}>
      <div className="dewey-landing-inner mx-auto max-w-3xl px-6 pb-24 pt-10">
        <nav className="flex items-center justify-between pb-5">
          <Link href="/" className="dewey-landing-brand">
            ${args.projectName}
          </Link>
          <span className="dewey-landing-meta">Docs</span>
        </nav>
        <div style={{ borderTop: '1px solid var(--dewey-border)' }} />

        <header className="dewey-landing-hero">
          <p className="dewey-landing-eyebrow">Documentation</p>
          <h1 className="dewey-landing-title">${args.projectName}</h1>
          <p className="dewey-landing-lead">
            Guides and references for ${args.projectName}.
          </p>
          {firstDoc && (
            <Link href={\`${args.basePath}/\${firstDoc.id}\`} className="dewey-landing-cta">
              Start with {firstDoc.title}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </header>

        <div className="dewey-landing-sections">
          {navigation.map((group) => (
            <section key={group.title} className="dewey-landing-section">
              <h2 className="dewey-section-label">{group.title}</h2>
              <div className="dewey-card-grid">
                {group.items.map((doc) => (
                  <Link
                    key={doc.id}
                    href={\`${args.basePath}/\${doc.id}\`}
                    className="dewey-card group"
                  >
                    <div className="dewey-card-body">
                      <h3 className="dewey-card-title">{doc.title}</h3>
                      {doc.description && (
                        <p className="dewey-card-desc">{doc.description}</p>
                      )}
                    </div>
                    <ArrowUpRight className="dewey-card-arrow" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
`,

  // ── Doc page (server component — loads data, generates metadata) ──────
  'src/app/docs/[...slug]/page.tsx': (args) => `import { getAllDocs, getDocBySlug, getNavigation } from '@/lib/dewey-docs'
import { DocView } from './content'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.slug.split('/') }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const slugStr = slug.join('/')
  const doc = getDocBySlug(slugStr)
  if (!doc) return {}
  return {
    title: \`\${doc.title} — ${args.projectName} Docs\`,
    description: doc.description,
  }
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params
  const slugStr = slug.join('/')
  const doc = getDocBySlug(slugStr)
  if (!doc) notFound()

  const navigation = getNavigation()
  const allDocs = getAllDocs()
  const idx = allDocs.findIndex((d) => d.slug === slugStr)
  const prevPage = idx > 0
    ? { id: allDocs[idx - 1].slug, title: allDocs[idx - 1].title }
    : undefined
  const nextPage = idx < allDocs.length - 1
    ? { id: allDocs[idx + 1].slug, title: allDocs[idx + 1].title }
    : undefined

  return (
    <DocView
      title={doc.title}
      description={doc.description}
      content={doc.content}
      agentContent={doc.agentContent}
      navigation={navigation}
      slug={slugStr}
      prevPage={prevPage}
      nextPage={nextPage}
      projectName="${args.projectName}"
      basePath="${args.basePath}"
    />
  )
}
`,

  // ── Doc content view (client component — full chrome) ─────────────────
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  'src/app/docs/[...slug]/content.tsx': (_args) => `'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Bot, User } from 'lucide-react'
import { MarkdownContent, CopyButtons } from '@arach/dewey'
import type { NavGroup } from '@/lib/dewey-docs'

// ── Heading extraction ──────────────────────────────────────────────────

type Heading = { id: string; title: string; depth: 2 | 3 }

function cleanHeadingText(text: string) {
  return text
    .replace(/\\[([^\\]]+)\\]\\([^)]+\\)/g, '$1')
    .replace(/\`([^\`]+)\`/g, '$1')
    .replace(/\\*\\*(.+?)\\*\\*/g, '$1')
    .replace(/\\*(.+?)\\*/g, '$1')
    .trim()
}

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = []
  const seen = new Map<string, number>()

  for (const line of content.split('\\n')) {
    const match = /^(#{2,3})\\s+(.+?)\\s*$/.exec(line)
    if (!match) continue

    const title = cleanHeadingText(match[2])
    if (!title) continue

    // Generate slug matching rehype-slug
    let base = title.toLowerCase().replace(/[^\\w\\s-]/g, '').replace(/\\s+/g, '-')
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    const id = count === 0 ? base : \`\${base}-\${count}\`

    headings.push({ id, title, depth: match[1].length as 2 | 3 })
  }

  return headings
}

function stripLeadHeading(content: string) {
  return content.replace(/^\\s*#\\s+.+\\n+/, '')
}

// ── DocView ─────────────────────────────────────────────────────────────

export function DocView({
  title,
  description,
  content,
  agentContent,
  navigation,
  slug,
  prevPage,
  nextPage,
  projectName,
  basePath,
}: {
  title: string
  description: string
  content: string
  agentContent?: string
  navigation: NavGroup[]
  slug: string
  prevPage?: { id: string; title: string }
  nextPage?: { id: string; title: string }
  projectName: string
  basePath: string
}) {
  const [viewAgent, setViewAgent] = useState(false)
  const activeContent = viewAgent && agentContent ? agentContent : content
  const renderedContent = useMemo(() => stripLeadHeading(activeContent), [activeContent])
  const headings = useMemo(() => extractHeadings(renderedContent), [renderedContent])

  const [activeId, setActiveId] = useState('')
  const [scrollProgress, setScrollProgress] = useState(0)

  // Scroll-spy for ToC
  useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-80px 0px -80% 0px' },
    )
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean)
    elements.forEach((el) => observer.observe(el!))
    return () => observer.disconnect()
  }, [headings])

  // Scroll progress
  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(max > 0 ? window.scrollY / max : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--dewey-bg)', color: 'var(--dewey-fg)' }}>
      {/* ── Header strip ──────────────────────────────────────────── */}
      <header
        className="fixed inset-x-0 top-0 z-40"
        style={{
          borderBottom: '1px solid var(--dewey-border)',
          background: 'color-mix(in srgb, var(--dewey-bg) 90%, transparent)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="mx-auto flex h-14 max-w-[92rem] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ fontFamily: 'var(--dewey-font-display)', color: 'var(--dewey-fg)' }}
            >
              {projectName}
            </span>
          </Link>
          <div
            className="flex items-center gap-5 font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: 'var(--dewey-muted)' }}
          >
            <Link
              href={basePath}
              className="transition-colors hover:opacity-80"
            >
              Docs
            </Link>
            <span className="hidden sm:block truncate">{title}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="absolute inset-x-0 bottom-0 h-[2px]">
          <div
            className="h-full transition-[width] duration-150"
            style={{
              width: \`\${scrollProgress * 100}%\`,
              background: 'var(--dewey-progress-color)',
            }}
          />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[92rem] pt-14">
        <div className="grid lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_13rem]">

          {/* ── Sidebar (desktop) ───────────────────────────────── */}
          <aside
            className="hidden lg:block sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto"
            style={{ borderRight: '1px solid var(--dewey-border)' }}
          >
            <div className="py-6 px-4 space-y-0">
              {navigation.map((group, groupIdx) => (
                <section
                  key={group.title}
                  className={groupIdx > 0 ? 'mt-5 pt-4' : ''}
                  style={groupIdx > 0 ? { borderTop: '1px solid var(--dewey-border)' } : undefined}
                >
                  <p
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] px-3 mb-2"
                    style={{ color: 'var(--dewey-muted)' }}
                  >
                    {group.title}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = item.id === slug
                      return (
                        <Link
                          key={item.id}
                          href={\`\${basePath}/\${item.id}\`}
                          className="block rounded-xl px-3 py-2 text-[13px] transition-colors"
                          style={{
                            background: isActive ? 'var(--dewey-active-bg)' : 'transparent',
                            color: isActive ? 'var(--dewey-active-fg)' : 'var(--dewey-nav-text)',
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {item.title}
                        </Link>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          </aside>

          {/* ── Sidebar (mobile) ────────────────────────────────── */}
          <div className="mb-4 px-4 pt-6 lg:hidden">
            <details
              className="rounded-xl p-4"
              style={{ border: '1px solid var(--dewey-border)' }}
            >
              <summary
                className="cursor-pointer list-none font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
                style={{ color: 'var(--dewey-muted)' }}
              >
                Browse Docs
              </summary>
              <div className="mt-4 space-y-4 pt-4" style={{ borderTop: '1px solid var(--dewey-border)' }}>
                {navigation.map((group) => (
                  <section key={group.title}>
                    <p
                      className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] mb-2"
                      style={{ color: 'var(--dewey-muted)' }}
                    >
                      {group.title}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = item.id === slug
                        return (
                          <Link
                            key={item.id}
                            href={\`\${basePath}/\${item.id}\`}
                            className="block rounded-xl px-3 py-2 text-sm transition-colors"
                            style={{
                              background: isActive ? 'var(--dewey-active-bg)' : 'transparent',
                              color: isActive ? 'var(--dewey-active-fg)' : 'var(--dewey-nav-text)',
                              fontWeight: isActive ? 600 : 400,
                            }}
                          >
                            {item.title}
                          </Link>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </details>
          </div>

          {/* ── Article ─────────────────────────────────────────── */}
          <article className="px-6 sm:px-10 lg:px-14 py-6">
            <div className="max-w-3xl">
              {/* Title + controls */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1
                    className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl"
                    style={{ fontFamily: 'var(--dewey-font-display)', color: 'var(--dewey-fg)' }}
                  >
                    {title}
                  </h1>
                  <p
                    className="mt-3 max-w-2xl text-[15px] leading-relaxed"
                    style={{ color: 'var(--dewey-secondary)' }}
                  >
                    {description}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2 shrink-0">
                  {agentContent && (
                    <button
                      onClick={() => setViewAgent(!viewAgent)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        border: '1px solid var(--dewey-border)',
                        color: viewAgent ? 'var(--dewey-active-fg)' : 'var(--dewey-muted)',
                        background: viewAgent ? 'var(--dewey-active-bg)' : 'transparent',
                      }}
                      title={viewAgent ? 'Switch to human view' : 'View agent-optimized version'}
                    >
                      {viewAgent ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                      <span>{viewAgent ? 'Human' : 'Agent'}</span>
                    </button>
                  )}
                  <CopyButtons markdownContent={renderedContent} agentContent={agentContent} />
                </div>
              </div>
            </div>

            {/* Inline ToC (small screens) */}
            {headings.length > 0 && (
              <div className="mt-8 xl:hidden">
                <div className="rounded-xl p-4" style={{ border: '1px solid var(--dewey-border)' }}>
                  <p
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: 'var(--dewey-muted)' }}
                  >
                    On This Page
                  </p>
                  <div className="mt-3 space-y-1">
                    {headings.map((heading) => (
                      <a
                        key={heading.id}
                        href={\`#\${heading.id}\`}
                        className={\`block py-1 text-[13px] transition-colors \${heading.depth === 3 ? 'ml-4' : ''}\`}
                        style={{
                          color: activeId === heading.id ? 'var(--dewey-fg)' : 'var(--dewey-nav-text)',
                          fontWeight: activeId === heading.id ? 500 : 400,
                        }}
                      >
                        {heading.title}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            {viewAgent && agentContent && (
              <div
                className="mt-4 rounded-lg px-4 py-2 font-mono text-xs"
                style={{
                  background: 'color-mix(in srgb, var(--dewey-active-bg) 8%, transparent)',
                  color: 'var(--dewey-muted)',
                }}
              >
                Viewing agent-optimized content — dense, structured, designed for LLMs
              </div>
            )}
            <div className="dewey-content mt-2 max-w-none">
              <MarkdownContent content={renderedContent} />
            </div>

            {/* Prev / Next */}
            {(prevPage || nextPage) && (
              <nav
                className="mt-12 grid gap-3 pt-8 md:grid-cols-2"
                style={{ borderTop: '1px solid var(--dewey-border)' }}
              >
                {prevPage ? (
                  <Link
                    href={\`\${basePath}/\${prevPage.id}\`}
                    className="group rounded-xl p-4 transition-all"
                    style={{ border: '1px solid var(--dewey-border)' }}
                  >
                    <span
                      className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
                      style={{ color: 'var(--dewey-muted)' }}
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Previous
                    </span>
                    <span className="mt-2 block text-sm font-medium" style={{ color: 'var(--dewey-fg)' }}>
                      {prevPage.title}
                    </span>
                  </Link>
                ) : <div />}
                {nextPage ? (
                  <Link
                    href={\`\${basePath}/\${nextPage.id}\`}
                    className="group rounded-xl p-4 text-left transition-all"
                    style={{ border: '1px solid var(--dewey-border)' }}
                  >
                    <span
                      className="flex items-center justify-end gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
                      style={{ color: 'var(--dewey-muted)' }}
                    >
                      Next
                      <ArrowRight className="h-3 w-3" />
                    </span>
                    <span className="mt-2 block text-right text-sm font-medium" style={{ color: 'var(--dewey-fg)' }}>
                      {nextPage.title}
                    </span>
                  </Link>
                ) : null}
              </nav>
            )}

            {/* Agent footer */}
            <footer
              className="mt-8 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.1em]"
              style={{ color: 'var(--dewey-muted)' }}
            >
              <span>AI-ready docs</span>
            </footer>
          </article>

          {/* ── Table of Contents (desktop) ─────────────────────── */}
          {headings.length > 0 && (
            <aside
              className="hidden xl:block sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto"
              style={{ borderLeft: '1px solid var(--dewey-border)' }}
            >
              <div className="py-6 px-5">
                <p
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: 'var(--dewey-muted)' }}
                >
                  On This Page
                </p>
                <div className="mt-3 space-y-1">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={\`#\${heading.id}\`}
                      className={\`block py-1 text-[13px] transition-colors \${heading.depth === 3 ? 'ml-3' : ''}\`}
                      style={{
                        color: activeId === heading.id ? 'var(--dewey-fg)' : 'var(--dewey-nav-text)',
                        fontWeight: activeId === heading.id ? 500 : 400,
                      }}
                    >
                      {heading.title}
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  )
}
`,

  // ── Docs CSS ──────────────────────────────────────────────────────────
  'src/app/docs/dewey-docs.css': () => `/* ═══════════════════════════════════════════════════════════════════════
   Dewey Docs Styles — generated by \`dewey site init\`
   Override --dewey-* vars in your globals.css to match your brand.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Design tokens ───────────────────────────────────────────────────── */

:root {
  --dewey-bg: #fafafa;
  --dewey-fg: #111110;
  --dewey-muted: #8b8579;
  --dewey-secondary: #5e5a52;
  --dewey-nav-text: #4c4841;
  --dewey-border: rgba(0, 0, 0, 0.08);
  --dewey-border-hover: rgba(0, 0, 0, 0.15);
  --dewey-active-bg: #111110;
  --dewey-active-fg: #ffffff;
  --dewey-hover-bg: rgba(0, 0, 0, 0.04);
  --dewey-code-bg: #f4f6f8;
  --dewey-code-border: rgba(0, 0, 0, 0.08);
  --dewey-progress-color: rgba(17, 17, 16, 0.2);
  --dewey-surface: transparent;
  --dewey-font-display: var(--font-display, var(--font-newsreader, Georgia, serif));
  --dewey-font-body: var(--font-geist-sans, system-ui, sans-serif);
  --dewey-font-mono: var(--font-geist-mono, ui-monospace, monospace);
}

/* ── Docs landing page ───────────────────────────────────────────────── */

.dewey-landing-brand {
  font-family: var(--dewey-font-display);
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--dewey-fg);
  text-decoration: none;
  transition: opacity 150ms;
}

.dewey-landing-brand:hover {
  opacity: 0.75;
}

.dewey-landing-meta {
  font-family: var(--dewey-font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dewey-muted);
}

.dewey-landing-hero {
  padding: 4rem 0 3rem;
}

.dewey-landing-eyebrow {
  font-family: var(--dewey-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--dewey-muted);
  margin: 0;
}

.dewey-landing-title {
  font-family: var(--dewey-font-display);
  font-size: clamp(2.75rem, 6vw, 3.5rem);
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0.75rem 0 0;
  color: var(--dewey-fg);
}

.dewey-landing-lead {
  margin: 1.25rem 0 0;
  max-width: 28rem;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--dewey-secondary);
}

.dewey-landing-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.75rem;
  padding: 0.625rem 1.125rem;
  border-radius: 0.75rem;
  background: var(--dewey-active-bg);
  color: var(--dewey-active-fg);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: opacity 150ms, transform 150ms;
}

.dewey-landing-cta:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.dewey-landing-sections {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.dewey-section-label {
  font-family: var(--dewey-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dewey-muted);
  margin: 0 0 1rem;
}

.dewey-card-grid {
  display: grid;
  gap: 0.75rem;
}

.dewey-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.375rem;
  border: 1px solid var(--dewey-border);
  border-radius: 0.875rem;
  background: var(--dewey-surface, transparent);
  text-decoration: none;
  color: inherit;
  transition: border-color 150ms, background 150ms, transform 150ms;
}

.dewey-card:hover {
  border-color: var(--dewey-border-hover);
  background: var(--dewey-hover-bg);
  transform: translateY(-1px);
}

.dewey-card-title {
  font-family: var(--dewey-font-display);
  font-size: 1.125rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  margin: 0;
  color: var(--dewey-fg);
}

.dewey-card-desc {
  margin: 0.375rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--dewey-muted);
}

.dewey-card-arrow {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  margin-top: 0.25rem;
  color: var(--dewey-muted);
  transition: color 150ms, transform 150ms;
}

.dewey-card:hover .dewey-card-arrow {
  color: var(--dewey-fg);
  transform: translate(2px, -2px);
}

/* ── Content typography ──────────────────────────────────────────────── */

.dewey-content {
  font-family: var(--dewey-font-body);
  line-height: 1.65;
}

.dewey-content p {
  margin-bottom: 0.6em;
}

.dewey-content h2 {
  font-family: var(--dewey-font-display);
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  margin-top: 2.25rem;
  margin-bottom: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--dewey-border);
}

.dewey-content h2:first-child {
  border-top: none;
  padding-top: 0;
  margin-top: 0;
}

.dewey-content h3 {
  font-family: var(--dewey-font-display);
  font-size: 1.2rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.dewey-content h4 {
  font-family: var(--dewey-font-body);
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.35rem;
}

.dewey-content ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 0.8rem;
}

.dewey-content ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin-bottom: 0.8rem;
}

.dewey-content li {
  margin-bottom: 0.3rem;
}

.dewey-content li::marker {
  color: #b0aaa0;
}

.dewey-content :is(h1, h2, h3, h4) {
  scroll-margin-top: 6rem;
  align-items: baseline;
  gap: 0.5rem;
}

.dewey-content :is(h3, h4) {
  gap: 0.375rem;
}

/* ── Code blocks ─────────────────────────────────────────────────────── */

.dewey-content .rounded-lg.overflow-hidden:has(pre) {
  background: var(--dewey-code-bg) !important;
  border-color: var(--dewey-code-border) !important;
}

.dewey-content .rounded-lg.overflow-hidden:has(pre) span[class*="uppercase"] {
  color: rgba(0, 0, 0, 0.4) !important;
}

/* ── Heading anchor links ────────────────────────────────────────────── */

.dewey-content :is(h1, h2, h3, h4) > a[title="Link to this section"] {
  flex-shrink: 0;
}

/* ── Syntax highlighting (warm-neutral) ──────────────────────────────── */

.dewey-content .hljs-keyword { color: #9a6e4a; font-weight: 500; }
.dewey-content .hljs-string { color: #5a8a6a; }
.dewey-content .hljs-number { color: #6a8caa; }
.dewey-content .hljs-property { color: #8a7a9a; }
.dewey-content .hljs-comment { color: #8a9090; font-style: italic; }
.dewey-content .hljs-type,
.dewey-content .hljs-title { color: #8a7a9a; }
.dewey-content .hljs-title.function_,
.dewey-content .hljs-function { color: #7a7a9a; }
.dewey-content .hljs-punctuation { color: #5c5c5c; }
.dewey-content .hljs-attr { color: #7a8a7a; }
.dewey-content .hljs-built_in { color: #aa8a6a; }
.dewey-content .hljs-literal { color: #6a8caa; }
.dewey-content .hljs-variable { color: #aa8a6a; }
.dewey-content .hljs-params { color: #4a4a4a; }
.dewey-content .hljs-meta { color: #8a9090; }
.dewey-content .hljs-name,
.dewey-content .hljs-tag,
.dewey-content .hljs-selector-tag { color: #5a8a6a; }
.dewey-content .hljs-selector-class { color: #8a7a9a; }
`,

  // ── Docs library (server-side) ────────────────────────────────────────
  'src/lib/dewey-docs.ts': (args) => `import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, basename, dirname, relative, resolve, sep } from 'path'
import matter from 'gray-matter'
import docsJson from '../../docs.json'

// ── Types ───────────────────────────────────────────────────────────────

export type DocMeta = {
  slug: string
  title: string
  description: string
  group: string
  order: number
}

export type DocEntry = DocMeta & {
  content: string
  agentContent?: string
}

export type NavGroup = {
  title: string
  items: { id: string; title: string; description?: string }[]
}

// ── Config ──────────────────────────────────────────────────────────────

const DOCS_DIR = join(process.cwd(), '${args.docsDir}')

// ── Catalog from docs.json ──────────────────────────────────────────────

interface DocsJsonGroup {
  id: string
  title: string
  items: { id: string; title: string; description?: string; order?: number }[]
}

interface DocsJsonData {
  name: string
  groups: DocsJsonGroup[]
}

const docsData = docsJson as DocsJsonData

// Build a lookup from slug → metadata
const CATALOG = new Map<string, { group: string; order: number; title: string; description: string }>()
let orderCounter = 0
for (const group of docsData.groups) {
  for (const item of group.items) {
    CATALOG.set(item.id, {
      group: group.title,
      order: item.order ?? orderCounter,
      title: item.title,
      description: item.description ?? '',
    })
    orderCounter++
  }
}

// ── Doc path index (for cross-doc link resolution) ──────────────────────

let docPathIndex: Map<string, string> | undefined

function getDocPathIndex() {
  if (docPathIndex) return docPathIndex
  const index = new Map<string, string>()

  function scan(dir: string) {
    if (!existsSync(dir)) return
    for (const file of readdirSync(dir, { withFileTypes: true })) {
      if (file.isDirectory()) {
        scan(join(dir, file.name))
      } else if (file.name.endsWith('.md') && file.name !== 'README.md') {
        const slug = basename(file.name, '.md')
        if (CATALOG.has(slug)) {
          index.set(resolve(join(dir, file.name)).toLowerCase(), slug)
        }
      }
    }
  }

  scan(DOCS_DIR)
  docPathIndex = index
  return index
}

// ── Cross-doc link resolution ───────────────────────────────────────────

function normalizeMarkdownTarget(target: string, sourcePath: string): string | null {
  const cleaned = target.trim().replace(/^<|>$/g, '')
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) return null
  if (!/\\.md(?:#.*)?$/i.test(cleaned)) return null

  const hashIndex = cleaned.indexOf('#')
  const rawPath = hashIndex === -1 ? cleaned : cleaned.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : cleaned.slice(hashIndex)
  const resolvedPath = rawPath.startsWith('/')
    ? resolve(rawPath)
    : resolve(dirname(sourcePath), rawPath)

  const internalSlug = getDocPathIndex().get(resolvedPath.toLowerCase())
  if (internalSlug) return \`${args.basePath}/\${internalSlug}\${hash}\`

  return null
}

function normalizeMarkdownLinks(content: string, sourcePath: string): string {
  return content.replace(/\\[([^\\]]+)\\]\\((<[^>]+>|[^)]+)\\)/g, (match, label, target) => {
    const normalized = normalizeMarkdownTarget(target, sourcePath)
    if (!normalized) return match
    return \`[\${label}](\${normalized})\`
  })
}

// ── Doc loading ─────────────────────────────────────────────────────────

function findDocFile(slug: string): string | null {
  function search(dir: string): string | null {
    if (!existsSync(dir)) return null
    for (const file of readdirSync(dir, { withFileTypes: true })) {
      if (file.isDirectory()) {
        const found = search(join(dir, file.name))
        if (found) return found
      } else if (file.name === \`\${slug}.md\`) {
        return join(dir, file.name)
      }
    }
    return null
  }
  return search(DOCS_DIR)
}

function loadDoc(filePath: string, slug: string): DocEntry | null {
  const def = CATALOG.get(slug)
  if (!def) return null

  const raw = readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const normalizedContent = normalizeMarkdownLinks(content, filePath)

  // Look for agent content
  let agentContent: string | undefined
  const agentPath = filePath.replace(/\\.md$/, '.agent.md')
  if (existsSync(agentPath)) {
    const agentRaw = readFileSync(agentPath, 'utf-8')
    const { content: agentBody } = matter(agentRaw)
    agentContent = agentBody.trim() || undefined
  }

  return {
    slug,
    title: (data.title as string) || def.title,
    description: (data.description as string) || def.description,
    group: def.group,
    order: def.order,
    content: normalizedContent,
    agentContent,
  }
}

// ── Public API ──────────────────────────────────────────────────────────

export function getAllDocs(): DocEntry[] {
  const entries: DocEntry[] = []

  function scan(dir: string) {
    if (!existsSync(dir)) return
    for (const file of readdirSync(dir, { withFileTypes: true })) {
      if (file.isDirectory()) {
        scan(join(dir, file.name))
      } else if (file.name.endsWith('.md') && !file.name.endsWith('.agent.md') && file.name !== 'README.md') {
        const slug = basename(file.name, '.md')
        const doc = loadDoc(join(dir, file.name), slug)
        if (doc) entries.push(doc)
      }
    }
  }

  scan(DOCS_DIR)
  return entries.sort((a, b) => a.order - b.order)
}

export function getDocBySlug(slug: string): DocEntry | undefined {
  const filePath = findDocFile(slug)
  if (!filePath) return undefined
  return loadDoc(filePath, slug) ?? undefined
}

export function getNavigation(): NavGroup[] {
  return docsData.groups.map((group) => ({
    title: group.title,
    items: group.items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
    })),
  }))
}
`,
}

// ---------------------------------------------------------------------------
// Ownership lists
// ---------------------------------------------------------------------------

export const SUBPATH_OWNED_FILES = [
  'src/app/docs/layout.tsx',
  'src/app/docs/page.tsx',
  'src/app/docs/[...slug]/page.tsx',
  'src/app/docs/[...slug]/content.tsx',
  'src/app/docs/dewey-docs.css',
  'src/lib/dewey-docs.ts',
] as const

export const SUBPATH_CONSUMER_OWNED_FILES = [
  'docs.json',
] as const

// ---------------------------------------------------------------------------
// Generate consumer-owned docs.json from scanned docs
// ---------------------------------------------------------------------------

interface ScannedDoc {
  slug: string
  title: string
  description?: string
  group: string
  order: number
}

export function generateDocsJson(projectName: string, docs: ScannedDoc[]): string {
  const groupMap = new Map<string, { id: string; title: string; items: { id: string; title: string; description?: string }[] }>()

  for (const doc of docs) {
    let group = groupMap.get(doc.group)
    if (!group) {
      group = {
        id: doc.group.toLowerCase().replace(/\s+/g, '-'),
        title: doc.group,
        items: [],
      }
      groupMap.set(doc.group, group)
    }
    group.items.push({
      id: doc.slug,
      title: doc.title,
      ...(doc.description ? { description: doc.description } : {}),
    })
  }

  return JSON.stringify({ name: projectName, groups: Array.from(groupMap.values()) }, null, 2) + '\n'
}
