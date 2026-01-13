import React, { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft, Book, Menu, X, ChevronRight, Sun, Moon, Copy, Check, Bot, ChevronLeft
} from 'lucide-react'

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
        className={`
          fixed top-14 left-0 bottom-0 w-64 z-50
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: isDark ? 'rgba(15, 18, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'var(--arc-border)'}`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="p-5 overflow-y-auto h-full">
          {/* Back to docs index */}
          <Link
            to={basePath}
            className="flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
            style={{ color: isDark ? '#9ca3af' : 'var(--arc-muted)' }}
          >
            <Book className="w-4 h-4" />
            {projectName} Docs
          </Link>

          {/* Navigation groups */}
          <nav className="space-y-6">
            {navigation.map((group) => (
              <div key={group.title}>
                <h3
                  className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-2"
                  style={{ color: isDark ? '#6b7280' : 'var(--arc-muted)' }}
                >
                  {group.title}
                </h3>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = currentPage === item.id
                    const Icon = item.icon
                    return (
                      <li key={item.id}>
                        <Link
                          to={`${basePath}/${item.id}`}
                          onClick={onClose}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors text-left"
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
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}

// Right sidebar table of contents
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
      className="hidden xl:block fixed top-14 right-0 w-52 h-[calc(100vh-56px)] overflow-y-auto"
      style={{
        background: isDark ? 'rgba(15, 18, 20, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'var(--arc-border)'}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="p-4">
        <h4
          className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-3"
          style={{ color: isDark ? '#6b7280' : 'var(--arc-muted)' }}
        >
          On this page
        </h4>
        <nav>
          <ul className="space-y-1.5">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block text-[13px] transition-colors leading-snug py-0.5"
                  style={{
                    paddingLeft: section.level === 3 ? '12px' : '0',
                    color: activeSection === section.id
                      ? 'var(--arc-accent)'
                      : isDark ? '#9ca3af' : 'var(--arc-muted)',
                    fontWeight: activeSection === section.id ? 500 : 400,
                  }}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
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
  prevPage,
  nextPage,
}: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [copied, setCopied] = useState<'markdown' | 'agent' | null>(null)
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)
  const location = useLocation()

  // Extract current page from URL
  const currentPage = location.pathname.replace(`${basePath}/`, '') || 'index'

  // Auto-extract sections from markdown if not provided
  const sections = useMemo(() => {
    if (propSections && propSections.length > 0) return propSections
    if (markdown) return extractSections(markdown)
    return []
  }, [propSections, markdown])

  const handleCopyMarkdown = async () => {
    if (markdown) {
      await navigator.clipboard.writeText(markdown)
      setCopied('markdown')
      setCopyMenuOpen(false)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const handleCopyForAgent = async () => {
    const agentContent = `# ${title}\n\n${description || ''}\n\n${markdown || ''}`
    await navigator.clipboard.writeText(agentContent)
    setCopied('agent')
    setCopyMenuOpen(false)
    setTimeout(() => setCopied(null), 2000)
  }

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

            {/* Brand */}
            <Link
              to={basePath}
              className="flex items-center gap-2.5 transition-colors"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: 'var(--arc-accent)',
                  boxShadow: '0 0 0 3px var(--arc-glow)',
                }}
              />
              <span
                className="text-lg font-semibold font-serif"
                style={{ color: isDark ? '#f3f4f6' : 'var(--arc-ink)' }}
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

      {/* Main content */}
      <main className="pt-14 lg:pl-64 xl:pr-52">
        <div className="max-w-3xl mx-auto px-6 py-10">
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

            {/* Page controls - Copy dropdown */}
            {markdown && (
              <div className="flex items-center gap-2 ml-4 mt-1">
                <div className="relative">
                  <button
                    onClick={() => setCopyMenuOpen(!copyMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                    style={{
                      color: isDark ? '#9ca3af' : 'var(--arc-muted)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'var(--arc-border)'}`,
                      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                        <ChevronRight className="w-3 h-3 rotate-90" />
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
                        className="absolute right-0 mt-1 w-40 rounded-lg shadow-lg z-50 py-1 overflow-hidden"
                        style={{
                          background: isDark ? '#1a1d20' : '#ffffff',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'var(--arc-border)'}`,
                          boxShadow: 'var(--arc-shadow-soft)',
                        }}
                      >
                        <button
                          onClick={handleCopyMarkdown}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left transition-colors hover:bg-black/5"
                          style={{ color: isDark ? '#d1d5db' : 'var(--arc-ink-soft)' }}
                        >
                          <Copy className="w-3.5 h-3.5 opacity-50" />
                          Copy Markdown
                        </button>
                        <button
                          onClick={handleCopyForAgent}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left transition-colors hover:bg-black/5"
                          style={{ color: isDark ? '#d1d5db' : 'var(--arc-ink-soft)' }}
                        >
                          <Bot className="w-3.5 h-3.5 opacity-50" />
                          Copy for Agent
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
    </div>
  )
}
