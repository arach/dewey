import React, { useEffect, useState, type AnchorHTMLAttributes, type ComponentType } from 'react'
import { ArrowLeft, Book, Menu, Moon, Sparkles, Sun, X } from 'lucide-react'
import { Badge, type BadgeVariant } from './Badge'
import { CopyButtons } from './CopyButtons'
import { PromptSlideout } from './PromptSlideout'

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

export interface DocSection {
  id: string
  title: string
  level: 2 | 3
}

const badgeVariants = {
  blue: 'info',
  emerald: 'success',
  purple: 'purple',
  amber: 'warning',
  rose: 'danger',
} as const satisfies Record<string, BadgeVariant>

type ShellLink = ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>

const DefaultShellLink: ShellLink = ({ href, children, ...props }) => (
  <a href={href} {...props}>{children}</a>
)

interface DocsSidebarProps {
  isOpen: boolean
  onClose: () => void
  currentPage: string
  navigation: NavGroup[]
  projectName: string
  basePath: string
  Link: ShellLink
}

function DocsSidebar({
  isOpen,
  onClose,
  currentPage,
  navigation,
  projectName,
  basePath,
  Link,
}: DocsSidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="dw-shell-overlay"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}
      <aside className={`dw-shell-sidebar${isOpen ? ' open' : ''}`} aria-label="Documentation navigation">
        <Link href={basePath} className="dw-shell-sidebar-home" onClick={onClose}>
          <Book aria-hidden="true" />
          {projectName} Docs
        </Link>
        <nav>
          {navigation.map((group) => (
            <section className="dw-shell-nav-group" key={group.title}>
              <h2 className="dw-shell-nav-title">{group.title}</h2>
              <ul className="dw-shell-nav-list">
                {group.items.map((item) => {
                  const isActive = currentPage === item.id
                  const Icon = item.icon
                  return (
                    <li key={item.id}>
                      <Link
                        href={`${basePath}/${item.id}`}
                        onClick={onClose}
                        className={`dw-shell-nav-link${isActive ? ' active' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {Icon && <Icon className="dw-shell-nav-icon" />}
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </nav>
      </aside>
    </>
  )
}

function TableOfContents({ sections }: { sections: DocSection[] }) {
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActiveSection(visible.target.id)
      },
      { rootMargin: '-100px 0px -66% 0px' },
    )

    for (const section of sections) {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [sections])

  if (sections.length === 0) return null

  return (
    <aside className="dw-shell-toc" aria-label="On this page">
      <h2 className="dw-shell-toc-title">On this page</h2>
      <ul className="dw-shell-toc-list">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={`dw-shell-toc-link${activeSection === section.id ? ' active' : ''}`}
              data-level={section.level}
              aria-current={activeSection === section.id ? 'location' : undefined}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export interface DocsLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  badge?: string
  badgeColor?: keyof typeof badgeVariants
  sections?: DocSection[]
  navigation: NavGroup[]
  projectName: string
  basePath?: string
  homeUrl?: string
  markdown?: string
  agentContent?: string
  /** Current document ID. Defaults to the browser pathname. */
  currentPage?: string
  /** Framework link adapter, such as Next Link or a React Router wrapper. */
  LinkComponent?: ShellLink
  prevPage?: { id: string; title: string }
  nextPage?: { id: string; title: string }
}

export function DocsLayout({
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
  currentPage: currentPageProp,
  LinkComponent = DefaultShellLink,
  prevPage,
  nextPage,
}: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [showPromptBuilder, setShowPromptBuilder] = useState(false)
  const browserPath = typeof window === 'undefined' ? '' : window.location.pathname
  const currentPage = currentPageProp ?? (browserPath.replace(`${basePath}/`, '') || 'index')
  const promptContent = agentContent || markdown || `# ${title}\n\n${description || ''}`

  return (
    <div className={`dw-docs-layout${isDark ? ' dark' : ''}`}>
      <header className="dw-shell-header">
        <div className="dw-shell-header-left">
          <button
            type="button"
            className="dw-shell-icon-button dw-shell-menu-button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <LinkComponent href={basePath} className="dw-shell-brand">
            <span className="dw-shell-brand-dot" aria-hidden="true" />
            <span>{projectName}</span>
          </LinkComponent>
          <span className="dw-shell-divider" aria-hidden="true" />
          <LinkComponent href={homeUrl} className="dw-shell-back">
            <ArrowLeft aria-hidden="true" />
            Home
          </LinkComponent>
        </div>
        <div className="dw-shell-header-right">
          <button
            type="button"
            className="dw-shell-icon-button"
            onClick={() => setIsDark((dark) => !dark)}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          <span className="dw-shell-label">Docs</span>
        </div>
      </header>

      <DocsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        navigation={navigation}
        projectName={projectName}
        basePath={basePath}
        Link={LinkComponent}
      />
      <TableOfContents sections={sections} />

      <main className="dw-shell-main">
        <article className="dw-shell-article">
          <header className="dw-shell-page-header">
            <div>
              {badge && <Badge variant={badgeVariants[badgeColor]}>{badge}</Badge>}
              <h1 className="dw-shell-page-title">{title}</h1>
              {description && <p className="dw-shell-page-description">{description}</p>}
            </div>
            {markdown && (
              <div className="dw-shell-page-actions">
                <button
                  type="button"
                  className="dw-button dw-button-outline"
                  onClick={() => setShowPromptBuilder(true)}
                >
                  <Sparkles aria-hidden="true" />
                  Prompt
                </button>
                <CopyButtons markdownContent={markdown} agentContent={agentContent} />
              </div>
            )}
          </header>

          <div className="dw-prose">{children}</div>

          {(prevPage || nextPage) && (
            <nav className="dw-prev-next" aria-label="Previous and next pages">
              <div>
                {prevPage && (
                  <LinkComponent className="dw-prev-next-link" href={`${basePath}/${prevPage.id}`}>
                    <span>
                      <span className="dw-prev-next-label">Previous</span>
                      <span className="dw-prev-next-title">{prevPage.title}</span>
                    </span>
                  </LinkComponent>
                )}
              </div>
              <div>
                {nextPage && (
                  <LinkComponent className="dw-prev-next-link" href={`${basePath}/${nextPage.id}`}>
                    <span>
                      <span className="dw-prev-next-label">Next</span>
                      <span className="dw-prev-next-title">{nextPage.title}</span>
                    </span>
                  </LinkComponent>
                )}
              </div>
            </nav>
          )}
        </article>
      </main>

      <PromptSlideout
        isOpen={showPromptBuilder}
        onClose={() => setShowPromptBuilder(false)}
        title={`Prompt for ${title}`}
        description="Copy an agent-ready version of this page."
        info="Review the page context, tailor the request, then copy it into your AI assistant."
        starterTemplate={promptContent}
      />
    </div>
  )
}

export default DocsLayout
