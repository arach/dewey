'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Bot, User } from 'lucide-react'
import { CopyButtons } from '@arach/dewey'
import type { NavGroup } from '@/lib/dewey-docs'

type Heading = { id: string; title: string; depth: 2 | 3 }

export function DocView({
  title,
  description,
  headings,
  navigation,
  slug,
  prevPage,
  nextPage,
  projectName,
  basePath,
  hasAgentContent,
  agentMDX,
  rawContent,
  rawAgentContent,
  children,
}: {
  title: string
  description: string
  headings: Heading[]
  navigation: NavGroup[]
  slug: string
  prevPage?: { id: string; title: string }
  nextPage?: { id: string; title: string }
  projectName: string
  basePath: string
  hasAgentContent: boolean
  agentMDX: ReactNode
  rawContent: string
  rawAgentContent?: string
  children: ReactNode
}) {
  const [viewAgent, setViewAgent] = useState(false)
  const [activeId, setActiveId] = useState('')
  const [scrollProgress, setScrollProgress] = useState(0)

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
      {/* Header */}
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
            <Link href={basePath} className="transition-colors hover:opacity-80">
              Docs
            </Link>
            <span className="hidden sm:block truncate">{title}</span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[2px]">
          <div
            className="h-full transition-[width] duration-150"
            style={{
              width: `${scrollProgress * 100}%`,
              background: 'var(--dewey-progress-color)',
            }}
          />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[92rem] pt-14">
        <div className="grid lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_13rem]">

          {/* Sidebar (desktop) */}
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
                          href={`${basePath}/${item.id}`}
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

          {/* Sidebar (mobile) */}
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
                            href={`${basePath}/${item.id}`}
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

          {/* Article */}
          <article className="px-6 sm:px-10 lg:px-14 py-6">
            <div className="max-w-3xl">
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
                  {hasAgentContent && (
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
                  <CopyButtons markdownContent={rawContent} agentContent={rawAgentContent} />
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
                        href={`#${heading.id}`}
                        className={`block py-1 text-[13px] transition-colors ${heading.depth === 3 ? 'ml-4' : ''}`}
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

            {/* Content — RSC-rendered MDX or agent MDX */}
            {viewAgent && agentMDX && (
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
              {viewAgent && agentMDX ? agentMDX : children}
            </div>

            {/* Prev / Next */}
            {(prevPage || nextPage) && (
              <nav
                className="mt-12 grid gap-3 pt-8 md:grid-cols-2"
                style={{ borderTop: '1px solid var(--dewey-border)' }}
              >
                {prevPage ? (
                  <Link
                    href={`${basePath}/${prevPage.id}`}
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
                    href={`${basePath}/${nextPage.id}`}
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

            <footer
              className="mt-8 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.1em]"
              style={{ color: 'var(--dewey-muted)' }}
            >
              <span>AI-ready docs</span>
            </footer>
          </article>

          {/* Table of Contents (desktop) */}
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
                      href={`#${heading.id}`}
                      className={`block py-1 text-[13px] transition-colors ${heading.depth === 3 ? 'ml-3' : ''}`}
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
