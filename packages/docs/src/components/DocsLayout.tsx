import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft, Book, Menu, X, ChevronRight, Sun, Moon, Copy, Check, Bot, ChevronLeft, Sparkles
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
          fixed top-14 left-0 bottom-0 w-72 z-50
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: isDark ? '#0f1214' : 'rgba(250, 250, 250, 0.95)',
          borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0, 0, 0, 0.1)'}`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="p-6 overflow-y-auto h-full">
          {/* Back to docs index */}
          <Link
            to={basePath}
            className="flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
            style={{ color: isDark ? '#9ca3af' : '#5c676c' }}
          >
            <Book className="w-4 h-4" />
            {projectName} Docs
          </Link>

          {/* Navigation groups */}
          <nav className="space-y-8">
            {navigation.map((group) => (
              <div key={group.title}>
                <h3
                  className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-3"
                  style={{ color: isDark ? '#6b7280' : '#5c676c' }}
                >
                  {group.title}
                </h3>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = currentPage === item.id
                    const Icon = item.icon
                    return (
                      <li key={item.id}>
                        <Link
                          to={`${basePath}/${item.id}`}
                          onClick={onClose}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left"
                          style={{
                            background: isActive
                              ? isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'
                              : 'transparent',
                            color: isActive
                              ? '#3b82f6'
                              : isDark ? '#9ca3af' : '#2e3538',
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
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
      className="hidden xl:block fixed top-14 right-0 w-56 h-[calc(100vh-56px)] overflow-y-auto"
      style={{
        background: isDark ? 'rgba(15, 18, 20, 0.8)' : 'rgba(250, 250, 250, 0.8)',
        borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0, 0, 0, 0.08)'}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="p-5">
        <h4
          className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-4"
          style={{ color: isDark ? '#6b7280' : '#5c676c' }}
        >
          On this page
        </h4>
        <nav>
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block text-[13px] transition-colors leading-snug"
                  style={{
                    paddingLeft: section.level === 3 ? '12px' : '0',
                    color: activeSection === section.id
                      ? '#3b82f6'
                      : isDark ? '#9ca3af' : '#5c676c',
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
  blue: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' },
  emerald: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#10b981' },
  purple: { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)', text: '#8b5cf6' },
  amber: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b' },
  rose: { bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.3)', text: '#f43f5e' },
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
  badgeColor = 'blue',
  sections = [],
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
  const [copied, setCopied] = useState<'markdown' | 'agent' | null>(null)
  const [showPromptBuilder, setShowPromptBuilder] = useState(false)
  const location = useLocation()

  // Extract current page from URL
  const currentPage = location.pathname.replace(`${basePath}/`, '') || 'index'

  const handleCopyMarkdown = async () => {
    if (markdown) {
      await navigator.clipboard.writeText(markdown)
      setCopied('markdown')
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const handleCopyForAgent = async () => {
    // Use provided agent content, or generate a basic version
    const content = agentContent || `# ${title}\n\n${description || ''}\n\n${markdown || ''}`
    await navigator.clipboard.writeText(content)
    setCopied('agent')
    setTimeout(() => setCopied(null), 2000)
  }

  const handleOpenPromptBuilder = () => {
    setShowPromptBuilder(true)
  }

  const currentBadge = badgeStyles[badgeColor] || badgeStyles.blue

  return (
    <div
      className="min-h-screen"
      style={{
        background: isDark ? '#0a0c0e' : '#fafafa',
        color: isDark ? '#e5e7eb' : '#101518',
      }}
    >
      {/* Top navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14"
        style={{
          backdropFilter: 'blur(12px)',
          background: isDark ? 'rgba(10, 12, 14, 0.9)' : 'rgba(250, 250, 250, 0.9)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0, 0, 0, 0.08)'}`,
        }}
      >
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 -ml-2 transition-colors"
              style={{ color: isDark ? '#9ca3af' : '#5c676c' }}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand */}
            <Link
              to={basePath}
              className="flex items-baseline gap-2 transition-colors font-display"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: '#3b82f6',
                  boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)',
                }}
              />
              <span className="text-lg font-semibold" style={{ color: isDark ? '#f3f4f6' : '#101518' }}>
                {projectName}
              </span>
            </Link>

            {/* Divider */}
            <span
              className="hidden sm:block w-px h-4"
              style={{ background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0, 0, 0, 0.15)' }}
            />

            {/* Back button */}
            <Link
              to={homeUrl}
              className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors group"
              style={{ color: isDark ? '#6b7280' : '#5c676c' }}
            >
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
              <span>Home</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 rounded transition-colors"
              style={{ color: isDark ? '#6b7280' : '#5c676c' }}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* DOCS label */}
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-[0.25em]"
              style={{ color: isDark ? '#f3f4f6' : '#101518' }}
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
      <main className="pt-14 lg:pl-72 xl:pr-56">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Page header with controls */}
          <div className="flex items-start justify-between mb-10">
            <div className="flex-1">
              {badge && (
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 text-xs font-semibold uppercase tracking-wider"
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
                  className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 font-display"
                  style={{ color: isDark ? '#f3f4f6' : '#101518' }}
                >
                  {title}
                </h1>
              )}

              {description && (
                <p
                  className="text-lg leading-relaxed"
                  style={{ color: isDark ? '#9ca3af' : '#5c676c' }}
                >
                  {description}
                </p>
              )}
            </div>

            {/* Page controls - Three visible copy buttons */}
            {markdown && (
              <div className="flex items-center gap-2 ml-4 mt-2">
                {/* Prompt Builder button */}
                <button
                  onClick={handleOpenPromptBuilder}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    color: '#8b5cf6',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    background: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)',
                  }}
                  title="Open prompt builder"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Prompt</span>
                </button>

                {/* Copy Markdown button */}
                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    color: isDark ? '#9ca3af' : '#5c676c',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.12)'}`,
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)',
                  }}
                  title="Copy as markdown"
                >
                  {copied === 'markdown' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {/* Copy for Agent button */}
                <button
                  onClick={handleCopyForAgent}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    color: '#3b82f6',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
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
              </div>
            )}
          </div>

          {/* Page content */}
          <div className="docs-prose">
            {children}
          </div>

          {/* Prev/Next navigation */}
          {(prevPage || nextPage) && (
            <div className="mt-12 pt-6 border-t flex justify-between items-center"
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
            >
              <div className="flex-1">
                {prevPage && (
                  <Link
                    to={`${basePath}/${prevPage.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors group"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      color: isDark ? '#9ca3af' : '#5c676c',
                    }}
                  >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    <div className="text-left">
                      <div className="text-[10px] uppercase tracking-wider opacity-60">Previous</div>
                      <div className="text-sm font-medium">{prevPage.title}</div>
                    </div>
                  </Link>
                )}
              </div>
              <div className="flex-1 text-right">
                {nextPage && (
                  <Link
                    to={`${basePath}/${nextPage.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors group"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      color: isDark ? '#9ca3af' : '#5c676c',
                    }}
                  >
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider opacity-60">Next</div>
                      <div className="text-sm font-medium">{nextPage.title}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Prose styles */}
      <style>{`
        .docs-prose {
          font-size: 15px;
          line-height: 1.75;
          color: ${isDark ? '#d1d5db' : '#2e3538'};
          overflow-wrap: break-word;
          word-wrap: break-word;
          min-width: 0;
        }

        .docs-prose h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: ${isDark ? '#f3f4f6' : '#101518'};
          margin: 3rem 0 1.25rem;
          padding-top: 2rem;
          border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'};
          scroll-margin-top: 100px;
        }

        .docs-prose h2:first-child {
          margin-top: 0;
          padding-top: 0;
          border-top: none;
        }

        .docs-prose h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: ${isDark ? '#f3f4f6' : '#101518'};
          margin: 2rem 0 1rem;
          scroll-margin-top: 100px;
        }

        .docs-prose p {
          margin: 0 0 1.25rem;
        }

        .docs-prose a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .docs-prose a:hover {
          text-decoration: underline;
        }

        .docs-prose strong {
          font-weight: 600;
          color: ${isDark ? '#f3f4f6' : '#101518'};
        }

        .docs-prose code {
          font-family: var(--font-mono);
          font-size: 13px;
          padding: 2px 6px;
          border-radius: 4px;
          background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
          color: ${isDark ? '#f3f4f6' : '#101518'};
        }

        .docs-prose pre {
          margin: 1.5rem 0;
          padding: 1rem;
          border-radius: 8px;
          background: ${isDark ? '#1a1d20' : '#f5f5f5'};
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
          overflow-x: auto;
        }

        .docs-prose pre code {
          padding: 0;
          background: transparent;
          font-size: 13px;
        }

        .docs-prose ul, .docs-prose ol {
          margin: 1.25rem 0;
          padding-left: 1.5rem;
        }

        .docs-prose li {
          margin: 0.5rem 0;
        }

        .docs-prose li::marker {
          color: ${isDark ? '#6b7280' : '#9ca3af'};
        }

        .docs-prose hr {
          border: none;
          border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'};
          margin: 3rem 0;
        }

        .docs-prose blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1.5rem 0;
          color: ${isDark ? '#9ca3af' : '#5c676c'};
          font-style: italic;
        }

        .docs-prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 14px;
        }

        .docs-prose th, .docs-prose td {
          padding: 0.75rem 1rem;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'};
          text-align: left;
        }

        .docs-prose th {
          background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
          font-weight: 600;
        }

        .docs-prose img {
          max-width: 100%;
          border-radius: 8px;
        }
      `}</style>

      {/* Prompt Builder Slideout */}
      {showPromptBuilder && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowPromptBuilder(false)}
          />
          <div
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 shadow-2xl"
            style={{
              background: isDark ? '#0f1214' : '#ffffff',
              borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            }}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(139, 92, 246, 0.15)' }}
                  >
                    <Sparkles className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                  </div>
                  <div>
                    <h2
                      className="font-semibold"
                      style={{ color: isDark ? '#f3f4f6' : '#101518' }}
                    >
                      Prompt Builder
                    </h2>
                    <p
                      className="text-xs"
                      style={{ color: isDark ? '#6b7280' : '#5c676c' }}
                    >
                      Build an AI-ready prompt from this page
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPromptBuilder(false)}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: isDark ? '#6b7280' : '#5c676c',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Template selection */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: isDark ? '#d1d5db' : '#2e3538' }}
                    >
                      Prompt Template
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        color: isDark ? '#d1d5db' : '#2e3538',
                      }}
                    >
                      <option value="explain">Explain this documentation</option>
                      <option value="implement">Help me implement this</option>
                      <option value="troubleshoot">Troubleshoot an issue</option>
                      <option value="custom">Custom prompt...</option>
                    </select>
                  </div>

                  {/* Context preview */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: isDark ? '#d1d5db' : '#2e3538' }}
                    >
                      Context (from this page)
                    </label>
                    <div
                      className="p-4 rounded-lg text-xs font-mono max-h-48 overflow-y-auto"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                        color: isDark ? '#9ca3af' : '#5c676c',
                      }}
                    >
                      <pre className="whitespace-pre-wrap">
                        {agentContent?.slice(0, 500) || markdown?.slice(0, 500) || 'No content available'}
                        {((agentContent?.length || 0) > 500 || (markdown?.length || 0) > 500) && '...'}
                      </pre>
                    </div>
                  </div>

                  {/* Additional instructions */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: isDark ? '#d1d5db' : '#2e3538' }}
                    >
                      Additional Instructions
                    </label>
                    <textarea
                      placeholder="Add specific requirements or questions..."
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        color: isDark ? '#d1d5db' : '#2e3538',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className="px-6 py-4 border-t flex gap-3"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
              >
                <button
                  onClick={() => setShowPromptBuilder(false)}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: isDark ? '#9ca3af' : '#5c676c',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const content = agentContent || markdown || ''
                    await navigator.clipboard.writeText(content)
                    setShowPromptBuilder(false)
                    setCopied('agent')
                    setTimeout(() => setCopied(null), 2000)
                  }}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: '#8b5cf6',
                    color: '#ffffff',
                  }}
                >
                  Copy Prompt
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
