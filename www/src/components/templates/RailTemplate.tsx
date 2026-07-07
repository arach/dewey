import { Rocket, BookOpen, Sparkles, Code, Search, Github, type LucideIcon } from 'lucide-react'
import { sampleNav } from '@/lib/sample-doc'
import type { TemplatePreviewProps } from '@/lib/templates'
import { TemplateThemeToggle } from './TemplateThemeToggle'

const ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  'book-open': BookOpen,
  sparkles: Sparkles,
  code: Code,
}

// Rail — an icon-only vertical rail (Linear-ish) with a wide content column.
// No text sidebar and no TOC sidebar; the rail is the whole navigation surface.
export function RailTemplate({ contentHtml, title, description }: TemplatePreviewProps) {
  const activeGroup = sampleNav.find((g) => g.items.some((i) => i.active)) ?? sampleNav[0]

  return (
    <div className="tpl tpl-rail" data-template="rail" data-theme="light">
      {/* Icon rail */}
      <nav className="rail-nav" aria-label="Sections">
        <div className="rail-brand" title="Dewey">◆</div>
        <div className="rail-items">
          {sampleNav.map((group) => {
            const Icon: LucideIcon = (group.icon ? ICONS[group.icon] : undefined) ?? Rocket
            const active = group === activeGroup
            return (
              <button
                key={group.title}
                className={`rail-item${active ? ' rail-item--active' : ''}`}
                title={group.title}
              >
                <Icon size={18} strokeWidth={1.75} />
                <span className="rail-tip">{group.title}</span>
              </button>
            )
          })}
        </div>
        <div className="rail-foot">
          <TemplateThemeToggle className="rail-item" />
          <button className="rail-item" title="GitHub">
            <Github size={17} strokeWidth={1.75} />
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="rail-main">
        <header className="rail-topbar">
          <div className="rail-crumbs">
            <span>{activeGroup.title}</span>
            <span className="rail-crumb-sep">/</span>
            <span className="rail-crumb-active">{title}</span>
          </div>
          <div className="rail-tabs">
            {activeGroup.items.map((item) => (
              <button
                key={item.title}
                className={`rail-tab${item.active ? ' rail-tab--active' : ''}`}
              >
                {item.title}
              </button>
            ))}
          </div>
          <button className="rail-search">
            <Search size={13} strokeWidth={2} />
            <span>Search</span>
            <kbd>⌘K</kbd>
          </button>
        </header>

        <main className="rail-content">
          <div className="rail-article">
            <p className="rail-eyebrow">{activeGroup.title}</p>
            <h1 className="rail-title">{title}</h1>
            <p className="rail-lede">{description}</p>
            <div className="tpl-prose" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </div>
        </main>
      </div>
    </div>
  )
}
