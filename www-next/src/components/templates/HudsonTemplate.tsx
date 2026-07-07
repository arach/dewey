import { sampleNav, sampleAgentLinks } from '@/lib/sample-doc'
import type { TemplatePreviewProps } from '@/lib/templates'
import { HudsonNavSection } from './HudsonNavSection'
import { HudsonThemeToggle } from './HudsonThemeToggle'

// Hudson — emerald accent, Geist Mono headings, top header bar + sidebar + TOC.
// Synced from production www/src/pages/templates/hudson.astro.
export function HudsonTemplate({ contentHtml, title, description, toc }: TemplatePreviewProps) {
  return (
    <div className="tpl tpl-hudson" data-template="hudson">
      <header className="hudson-header">
        <div className="hudson-header-left">
          <a href="#" className="hudson-header-brand">
            Hudson
          </a>
          <span className="hudson-header-sep">/</span>
          <a href="#" className="hudson-header-brand hudson-header-brand--active">
            Docs
          </a>
        </div>
        <div className="hudson-header-right">
          <a href="#" className="hudson-header-link">
            llms.txt
          </a>
          <a href="#" className="hudson-header-icon" title="GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <button className="hudson-search-btn" type="button" disabled>
            Search…
            <span className="hudson-search-key">⌘K</span>
          </button>
          <HudsonThemeToggle className="hudson-theme-btn" />
        </div>
      </header>

      <div className="hudson-body">
        <nav className="hudson-sidebar" aria-label="Docs">
          {sampleNav.map((group, i) => (
            <HudsonNavSection key={group.title} title={group.title} bordered={i > 0}>
              <ul className="hudson-nav-list">
                {group.items.map((item) => (
                  <li key={item.title}>
                    <a href="#" className={`hudson-nav-item${item.active ? ' active' : ''}`}>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </HudsonNavSection>
          ))}

          <div className="hudson-nav-section hudson-nav-section--bordered">
            <div className="hudson-nav-label hudson-nav-label--static">For AI Agents</div>
            <ul className="hudson-nav-list">
              {sampleAgentLinks.slice(0, 2).map((link) => (
                <li key={link.title}>
                  <a href="#" className="hudson-nav-item hudson-nav-item--muted">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <main className="hudson-main">
          <div className="hudson-content-area">
            <div className="hudson-page-actions">
              <button className="hudson-copy-btn" type="button" disabled>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy for agent
              </button>
              <button className="hudson-copy-btn" type="button" disabled>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy markdown
              </button>
            </div>

            <article className="hudson-prose">
              <h1>{title}</h1>
              <p className="hudson-lede">{description}</p>
              <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
            </article>

            <div className="hudson-agent-footer">
              <span className="hudson-agent-footer-label">For AI agents</span>
              <div className="hudson-agent-footer-links">
                <a href="#">llms.txt</a>
                <span className="hudson-agent-footer-sep">|</span>
                <a href="#">llms-full.txt</a>
              </div>
            </div>
          </div>
        </main>

        {toc.length > 0 && (
          <aside className="hudson-toc" aria-label="On this page">
            <p className="hudson-toc-label">On this page</p>
            <ul className="hudson-toc-list">
              {toc.map((heading) => (
                <li key={heading.id}>
                  <a
                    className="hudson-toc-link"
                    data-level={heading.depth}
                    href={`#${heading.id}`}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  )
}