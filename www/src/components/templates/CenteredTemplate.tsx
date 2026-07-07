import type { TemplatePreviewProps } from '@/lib/templates'
import { TemplateThemeToggle } from './TemplateThemeToggle'

// Centered — no sidebar. A single narrow reading measure with a floating TOC
// that sits in the right margin. Serif headings, generous vertical rhythm,
// essay/documentation feel.
export function CenteredTemplate({ contentHtml, title, description, toc }: TemplatePreviewProps) {
  return (
    <div className="tpl tpl-centered" data-template="centered" data-theme="light">
      <header className="ctr-header">
        <a className="ctr-brand" href="#">
          <span className="ctr-brand-mark">D</span>
          dewey
        </a>
        <nav className="ctr-header-nav">
          <a href="#">Docs</a>
          <a href="#">Skills</a>
          <a href="#">GitHub</a>
          <TemplateThemeToggle className="ctr-theme" />
        </nav>
      </header>

      {/* Floating TOC in the right margin */}
      {toc.length > 0 && (
        <aside className="ctr-toc" aria-label="On this page">
          <p className="ctr-toc-label">On this page</p>
          <ul>
            {toc.map((h) => (
              <li key={h.id} className={h.depth === 3 ? 'ctr-toc-sub' : ''}>
                <a href={`#${h.id}`}>{h.text}</a>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <main className="ctr-main">
        <article className="ctr-article">
          <p className="ctr-kicker">Documentation</p>
          <h1 className="ctr-title">{title}</h1>
          <p className="ctr-lede">{description}</p>
          <div className="ctr-rule" />
          <div className="tpl-prose" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          <footer className="ctr-footer">
            <a href="#">← Overview</a>
            <a href="#">Configuration →</a>
          </footer>
        </article>
      </main>
    </div>
  )
}
