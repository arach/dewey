import React, { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft, Book, Menu, X, ChevronRight, Sun, Moon, Copy, Check, Bot, ChevronLeft, Sparkles
} from 'lucide-react'
import { PromptSlideout } from './PromptSlideout'

// Navigation structure for docs - consumers will override this
export interface NavItem {
  id: string
  title: string
  icon?: React.ComponentType<{ className?: string }>
  description?: string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

// Section type for table of contents
export interface DocSection {
  id: string
  title: string
  level: 2 | 3
}

// Extract sections from markdown content
function extractSections(markdown: string): DocSection[] {
  const sections: DocSection[] = []
  const lines = markdown.split('\n')

  for (const line of lines) {
    // Match ## and ### headings
    const h2Match = line.match(/^##\s+(.+)$/)
    const h3Match = line.match(/^###\s+(.+)$/)

    if (h2Match) {
      const title = h2Match[1].replace(/[`*_]/g, '') // Remove markdown formatting
      const id = title.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '')
      sections.push({ id, title, level: 2 })
    } else if (h3Match) {
      const title = h3Match[1].replace(/[`*_]/g, '')
      const id = title.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '')
      sections.push({ id, title, level: 3 })
    }
  }

  return sections
}

interface DocsSidebarProps {
  isOpen: boolean
  onClose: () => void
  currentPage: string
  navigation: NavGroup[]
  isDark: boolean
  projectName: string
  basePath: string
}

// Collapsible sidebar group
function SidebarGroup({
  group,
  currentPage,
  basePath,
  onClose,
  isDark,
}: {
  group: NavGroup
  currentPage: string
  basePath: string
  onClose: () => void
  isDark: boolean
}) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="dw-sidebar-group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="dw-sidebar-group-title"
        style={{ color: isDark ? '#6b7280' : 'var(--arc-muted)' }}
      >
        <span>{group.title}</span>
        <svg
          className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {isOpen && (
        <ul className="mt-1 space-y-0.5">
          {group.items.map((item) => {
            const isActive = currentPage === item.id
            const Icon = item.icon
            return (
              <li key={item.id}>
                <Link
                  to={`${basePath}/${item.id}`}
                  onClick={onClose}
                  className={`dw-sidebar-item ${isActive ? 'active' : ''}`}
                  style={{
                    background: isActive
                      ? isDark ? 'rgba(240, 124, 79, 0.15)' : 'rgba(240, 124, 79, 0.1)'
                      : 'transparent',
                    color: isActive
                      ? 'var(--arc-accent)'
                      : isDark ? '#d1d5db' : 'var(--arc-ink-soft)',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {Icon && <Icon className="w-4 h-4 flex-shrink-0 opacity-60" />}
                  <span>{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function DocsSidebar({
  isOpen,
  onClose,
  currentPage,
  navigation,
  isDark,
  projectName,
  basePath,
}: DocsSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dw-sidebar ${isOpen ? 'open' : ''} ${isDark ? 'dark' : ''}`}
        style={{
          background: isDark ? 'rgba(15, 18, 20, 0.95)' : 'rgba(247, 243, 236, 0.95)',
          borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'var(--arc-border)'}`,
          transform: isOpen ? 'translateX(0)' : undefined,
        }}
      >
        <div className="dw-sidebar-header">
          {/* Back to docs index */}
          <Link
            to={basePath}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: isDark ? '#9ca3af' : 'var(--arc-muted)' }}
          >
            <Book className="w-4 h-4" />
            <span className="dw-sidebar-title">{projectName} Docs</span>
          </Link>
        </div>

        {/* Navigation groups with collapsible sections */}
        <nav className="dw-sidebar-nav">
          {navigation.map((group) => (
            <SidebarGroup
              key={group.title}
              group={group}
              currentPage={currentPage}
              basePath={basePath}
              onClose={onClose}
              isDark={isDark}
            />
          ))}
        </nav>
      </aside>
    </>
  )
}

// Right sidebar table of contents with Arc styling
function TableOfContents({ sections, isDark }: { sections: DocSection[], isDark: boolean }) {
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -66% 0px' }
    )

    sections.forEach((section) => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  if (!sections || sections.length === 0) return null

  return (
    <aside
      className={`dw-toc hidden xl:block ${isDark ? 'dark' : ''}`}
      style={{
        background: isDark ? 'rgba(15, 18, 20, 0.8)' : 'rgba(247, 243, 236, 0.6)',
        borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16, 21, 24, 0.08)'}`,
      }}
    >
      <h4 className="dw-toc-title" style={{ color: isDark ? '#6b7280' : 'var(--arc-muted)' }}>
        On this page
      </h4>
      <nav>
        <ul className="dw-toc-list">
          {sections.map((section) => {
            const isActive = activeSection === section.id
            return (
              <li key={section.id} className="dw-toc-item">
                <a
                  href={`#${section.id}`}
                  className={`dw-toc-link ${isActive ? 'active' : ''}`}
                  data-level={section.level}
                  style={{
                    paddingLeft: section.level === 3 ? '1.5rem' : '0.75rem',
                    fontSize: section.level === 3 ? '0.75rem' : '0.8125rem',
                    color: isActive
                      ? 'var(--arc-accent)'
                      : isDark ? '#6b7280' : 'var(--arc-muted)',
                    fontWeight: isActive ? 500 : 400,
                    borderLeftColor: isActive ? 'var(--arc-accent)' : 'transparent',
                  }}
                >
                  {section.title}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

// Badge colors
const badgeStyles: Record<string, { bg: string, border: string, text: string }> = {
  blue: { bg: 'rgba(46, 95, 165, 0.1)', border: 'rgba(46, 95, 165, 0.3)', text: 'var(--arc-accent-3)' },
  emerald: { bg: 'rgba(31, 122, 101, 0.1)', border: 'rgba(31, 122, 101, 0.3)', text: 'var(--arc-accent-2)' },
  orange: { bg: 'rgba(240, 124, 79, 0.1)', border: 'rgba(240, 124, 79, 0.3)', text: 'var(--arc-accent)' },
  amber: { bg: 'rgba(208, 156, 54, 0.1)', border: 'rgba(208, 156, 54, 0.3)', text: 'var(--arc-accent-4)' },
  purple: { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)', text: '#8b5cf6' },
}

// Main layout wrapper
export interface DocsLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  badge?: string
  badgeColor?: keyof typeof badgeStyles
  sections?: DocSection[]
  navigation: NavGroup[]
  projectName: string
  basePath?: string
  homeUrl?: string
  markdown?: string
  /** Agent-optimized content for "Copy for Agent" button */
  agentContent?: string
  // Prev/Next navigation
  prevPage?: { id: string; title: string }
  nextPage?: { id: string; title: string }
}

export default function DocsLayout({
  children,
  title,
  description,
  badge,
  badgeColor = 'orange',
  sections: propSections,
  navigation,
  projectName,
  basePath = '/docs',
  homeUrl = '/',
  markdown,
  agentContent,
  prevPage,
  nextPage,
}: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [copied, setCopied] = useState<'markdown' | 'agent' | 'plain' | null>(null)
  const [showPromptBuilder, setShowPromptBuilder] = useState(false)
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)
  const [agentPreview, setAgentPreview] = useState<{ content: string; copied: boolean } | null>(null)
  const location = useLocation()

  // Extract current page from URL
  const currentPage = location.pathname.replace(`${basePath}/`, '') || 'index'

  // Auto-extract sections from markdown if not provided
  const sections = useMemo(() => {
    if (propSections && propSections.length > 0) return propSections
    if (markdown) return extractSections(markdown)
    return []
  }, [propSections, markdown])

  // Strip markdown syntax to plain text
  const stripMarkdown = (md: string): string => {
    return md
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      .replace(/^[\s]*[-*+]\s+/gm, '• ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  const handleCopyMarkdown = async () => {
    if (markdown) {
      await navigator.clipboard.writeText(markdown)
      setCopied('markdown')
      setCopyMenuOpen(false)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const handleCopyPlain = async () => {
    if (markdown) {
      await navigator.clipboard.writeText(stripMarkdown(markdown))
      setCopied('plain')
      setCopyMenuOpen(false)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const handleCopyForAgent = () => {
    const content = agentContent || `# ${title}\n\n${description || ''}\n\n${markdown || ''}`
    setAgentPreview({ content, copied: false })
  }

  const handleAgentCopy = async () => {
    if (!agentPreview) return
    await navigator.clipboard.writeText(agentPreview.content)
    setAgentPreview({ ...agentPreview, copied: true })
    setCopied('agent')
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setAgentPreview(null)
      setCopied(null)
    }, 5000)
  }

  const closeAgentPreview = () => {
    setAgentPreview(null)
  }

  // Close agent preview on escape
  useEffect(() => {
    if (!agentPreview) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAgentPreview(null)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [agentPreview])

  const currentBadge = badgeStyles[badgeColor] || badgeStyles.orange

  return (
    <div
      className="min-h-screen"
      style={{
        background: isDark ? '#0a0c0e' : 'var(--arc-paper)',
        color: isDark ? '#e5e7eb' : 'var(--arc-ink)',
      }}
    >
      {/* Top navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14"
        style={{
          backdropFilter: 'blur(12px)',
          background: isDark ? 'rgba(10, 12, 14, 0.9)' : 'rgba(247, 243, 236, 0.9)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'var(--arc-border)'}`,
        }}
      >
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 -ml-2 transition-colors"
              style={{ color: isDark ? '#9ca3af' : 'var(--arc-muted)' }}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand - Arc-style with dot */}
            <Link
              to={basePath}
              className="flex items-baseline gap-2.5 transition-colors hover:opacity-80"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 relative top-[1px]"
                style={{
                  background: 'var(--arc-accent)',
                  boxShadow: '0 0 0 4px rgba(240, 124, 79, 0.2)',
                }}
              />
              <span
                className="text-lg font-semibold tracking-tight"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: isDark ? '#f3f4f6' : 'var(--arc-ink)',
                  letterSpacing: '-0.01em',
                }}
              >
                {projectName}
              </span>
            </Link>

            {/* Divider */}
            <span
              className="hidden sm:block w-px h-4"
              style={{ background: isDark ? 'rgba(255,255,255,0.12)' : 'var(--arc-border)' }}
            />

            {/* Back button */}
            <Link
              to={homeUrl}
              className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors group"
              style={{ color: isDark ? '#6b7280' : 'var(--arc-muted)' }}
            >
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
              <span>Home</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                color: isDark ? '#9ca3af' : 'var(--arc-muted)',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              }}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* DOCS label */}
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{
                fontFamily: 'var(--font-mono)',
                color: isDark ? '#6b7280' : 'var(--arc-muted)',
              }}
            >
              DOCS
            </span>
          </div>
        </div>
      </nav>

      {/* Left sidebar */}
      <DocsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        navigation={navigation}
        isDark={isDark}
        projectName={projectName}
        basePath={basePath}
      />

      {/* Right table of contents */}
      <TableOfContents sections={sections} isDark={isDark} />

      {/* Main content - Arc-style layout with proper widths */}
      <main className="pt-14 lg:pl-[280px] xl:pr-[220px]">
        <div className="max-w-[48rem] mx-auto px-8 py-12">
          {/* Page header with controls */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              {badge && (
                <div
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border mb-3 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    background: currentBadge.bg,
                    borderColor: currentBadge.border,
                    color: currentBadge.text,
                  }}
                >
                  {badge}
                </div>
              )}

              {title && (
                <h1
                  className="text-3xl font-semibold tracking-tight mb-3 font-serif"
                  style={{ color: isDark ? '#f3f4f6' : 'var(--arc-ink)' }}
                >
                  {title}
                </h1>
              )}

              {description && (
                <p
                  className="text-base leading-relaxed"
                  style={{ color: isDark ? '#9ca3af' : 'var(--arc-muted)' }}
                >
                  {description}
                </p>
              )}
            </div>

            {/* Page controls - Order: Prompt → Agent → Copy (with dropdown) */}
            {markdown && (
              <div className="flex items-center gap-2 ml-4 mt-1">
                {/* 1. AI Prompt - Opens slideout */}
                <button
                  onClick={() => setShowPromptBuilder(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:shadow-sm"
                  style={{
                    color: 'var(--arc-accent)',
                    border: '1px solid rgba(240, 124, 79, 0.3)',
                    background: isDark ? 'rgba(240, 124, 79, 0.1)' : 'rgba(240, 124, 79, 0.08)',
                  }}
                  title="Open AI prompt builder"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Prompt</span>
                </button>

                {/* 2. Agent - Direct copy of agent content */}
                <button
                  onClick={handleCopyForAgent}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:shadow-sm"
                  style={{
                    color: 'var(--arc-accent-2)',
                    border: '1px solid rgba(31, 122, 101, 0.3)',
                    background: isDark ? 'rgba(31, 122, 101, 0.1)' : 'rgba(31, 122, 101, 0.08)',
                  }}
                  title="Copy agent-optimized content"
                >
                  {copied === 'agent' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5" />
                      <span>Agent</span>
                    </>
                  )}
                </button>

                {/* 3. Copy - Dropdown with Markdown / Plain text */}
                <div className="relative">
                  <button
                    onClick={() => setCopyMenuOpen(!copyMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:shadow-sm"
                    style={{
                      color: isDark ? '#9ca3af' : 'var(--arc-muted)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'var(--arc-border)'}`,
                      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)',
                    }}
                    title="Copy page content"
                  >
                    {copied === 'markdown' || copied === 'plain' ? (
                      <>
                        <Check className="w-3.5 h-3.5" style={{ color: 'var(--arc-accent-2)' }} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                        <ChevronRight className="w-3 h-3 rotate-90 -ml-0.5" />
                      </>
                    )}
                  </button>

                  {/* Dropdown menu */}
                  {copyMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setCopyMenuOpen(false)}
                      />
                      <div
                        className="absolute right-0 mt-1 w-32 rounded-lg shadow-lg z-50 py-1 overflow-hidden"
                        style={{
                          background: isDark ? '#1a1d20' : '#ffffff',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'var(--arc-border)'}`,
                          boxShadow: '0 4px 12px rgba(16, 21, 24, 0.12)',
                        }}
                      >
                        <button
                          onClick={handleCopyMarkdown}
                          className="w-full flex items-center justify-end gap-2 px-3 py-2 text-[12px] text-right transition-colors"
                          style={{ color: isDark ? '#d1d5db' : 'var(--arc-ink-soft)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          Markdown
                        </button>
                        <button
                          onClick={handleCopyPlain}
                          className="w-full flex items-center justify-end gap-2 px-3 py-2 text-[12px] text-right transition-colors"
                          style={{ color: isDark ? '#d1d5db' : 'var(--arc-ink-soft)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          Plain text
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Page content */}
          <div className="docs-content">
            {children}
          </div>

          {/* Prev/Next navigation */}
          {(prevPage || nextPage) && (
            <div className="mt-12 pt-6 border-t flex justify-between items-center"
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'var(--arc-border)' }}
            >
              <div className="flex-1">
                {prevPage && (
                  <Link
                    to={`${basePath}/${prevPage.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all group hover:shadow-md"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'var(--arc-border)',
                      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" style={{ color: isDark ? '#6b7280' : 'var(--arc-muted)' }} />
                    <div className="text-left">
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: isDark ? '#6b7280' : 'var(--arc-muted)' }}>Previous</div>
                      <div className="text-sm font-medium" style={{ color: isDark ? '#d1d5db' : 'var(--arc-ink-soft)' }}>{prevPage.title}</div>
                    </div>
                  </Link>
                )}
              </div>
              <div className="flex-1 text-right">
                {nextPage && (
                  <Link
                    to={`${basePath}/${nextPage.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all group hover:shadow-md"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'var(--arc-border)',
                      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: isDark ? '#6b7280' : 'var(--arc-muted)' }}>Next</div>
                      <div className="text-sm font-medium" style={{ color: isDark ? '#d1d5db' : 'var(--arc-ink-soft)' }}>{nextPage.title}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" style={{ color: isDark ? '#6b7280' : 'var(--arc-muted)' }} />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Content styles - no conflicting pre styles */}
      <style>{`
        .docs-content {
          font-size: 15px;
          line-height: 1.7;
          color: ${isDark ? '#d1d5db' : 'var(--arc-ink-soft)'};
        }

        .docs-content h2 {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          font-weight: 600;
          color: ${isDark ? '#f3f4f6' : 'var(--arc-ink)'};
          margin: 2.5rem 0 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'var(--arc-border)'};
          scroll-margin-top: 80px;
        }

        .docs-content h2:first-child {
          margin-top: 0;
          padding-top: 0;
          border-top: none;
        }

        .docs-content h3 {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          font-weight: 600;
          color: ${isDark ? '#f3f4f6' : 'var(--arc-ink)'};
          margin: 1.75rem 0 0.75rem;
          scroll-margin-top: 80px;
        }

        .docs-content p {
          margin: 0 0 1rem;
        }

        .docs-content a {
          color: var(--arc-accent);
          text-decoration: none;
          font-weight: 500;
        }

        .docs-content a:hover {
          text-decoration: underline;
        }

        .docs-content strong {
          font-weight: 600;
          color: ${isDark ? '#f3f4f6' : 'var(--arc-ink)'};
        }

        .docs-content code:not(pre code) {
          font-family: var(--font-mono);
          font-size: 13px;
          padding: 2px 6px;
          border-radius: 4px;
          background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'};
          color: ${isDark ? '#e5e7eb' : 'var(--arc-ink)'};
        }

        .docs-content ul, .docs-content ol {
          margin: 1rem 0;
          padding-left: 1.25rem;
        }

        .docs-content li {
          margin: 0.4rem 0;
        }

        .docs-content li::marker {
          color: var(--arc-accent-2);
        }

        .docs-content hr {
          border: none;
          border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'var(--arc-border)'};
          margin: 2.5rem 0;
        }

        .docs-content blockquote {
          border-left: 3px solid var(--arc-accent);
          padding-left: 1rem;
          margin: 1.25rem 0;
          color: ${isDark ? '#9ca3af' : 'var(--arc-muted)'};
          font-style: italic;
        }

        .docs-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.25rem 0;
          font-size: 14px;
        }

        .docs-content th, .docs-content td {
          padding: 0.6rem 0.8rem;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'var(--arc-border)'};
          text-align: left;
        }

        .docs-content th {
          background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
          font-weight: 600;
          font-size: 13px;
        }

        .docs-content img {
          max-width: 100%;
          border-radius: 8px;
        }
      `}</style>

      {/* Agent Content Preview Slideout */}
      {agentPreview && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{
              background: 'rgba(16, 21, 24, 0.3)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={closeAgentPreview}
          />
          <div
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 shadow-2xl flex flex-col"
            style={{
              background: isDark ? '#16181c' : 'var(--arc-paper, #f7f3ec)',
              borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'var(--arc-border, rgba(16,21,24,0.1))'}`,
              animation: 'slideInRight 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'var(--arc-border, rgba(16,21,24,0.1))'}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.12)' }}
                >
                  <Bot className="w-4 h-4" style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <h2
                    className="font-semibold text-sm"
                    style={{ color: isDark ? '#f3f4f6' : 'var(--arc-ink, #101518)' }}
                  >
                    Agent-Optimized Content
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: isDark ? '#6b7280' : 'var(--arc-muted, #5c676c)' }}
                  >
                    Dense, structured content for AI assistants
                  </p>
                </div>
              </div>
              <button
                onClick={closeAgentPreview}
                className="p-2 rounded-lg transition-colors hover:bg-black/5"
                style={{ color: isDark ? '#6b7280' : 'var(--arc-muted, #5c676c)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-5">
              <pre
                className="text-xs font-mono whitespace-pre-wrap break-words"
                style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.75)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'var(--arc-border, rgba(16,21,24,0.1))'}`,
                  color: isDark ? '#d1d5db' : 'var(--arc-ink, #2e3538)',
                  lineHeight: 1.6,
                }}
              >
                {agentPreview.content}
              </pre>
            </div>

            {/* Footer */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'var(--arc-border, rgba(16,21,24,0.1))'}`,
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.5)',
              }}
            >
              <span className="text-xs" style={{ color: isDark ? '#6b7280' : 'var(--arc-muted, #5c676c)' }}>
                {agentPreview.content.length.toLocaleString()} characters
              </span>
              <button
                onClick={handleAgentCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: agentPreview.copied ? '#22c55e' : '#22c55e',
                  color: '#ffffff',
                  opacity: agentPreview.copied ? 0.9 : 1,
                }}
              >
                {agentPreview.copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {agentPreview.copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}

      {/* Prompt Slideout - Using the real PromptSlideout component */}
      <PromptSlideout
        isOpen={showPromptBuilder}
        onClose={() => setShowPromptBuilder(false)}
        title={`${title} - AI Prompt`}
        description="Build a prompt from this documentation page"
        info={`This page contains documentation about "${title}". Edit the template below to customize your prompt, then copy to use with any AI assistant.`}
        starterTemplate={`Help me understand and use "${title}".

Here's the documentation:

${agentContent || markdown || 'No content available'}

{INSTRUCTIONS}`}
        params={[
          { name: 'INSTRUCTIONS', description: 'Additional questions or requirements', example: 'Focus on the API usage' },
        ]}
      />
    </div>
  )
}
