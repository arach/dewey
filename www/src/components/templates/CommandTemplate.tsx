import { sampleNav } from '@/lib/sample-doc'
import type { TemplatePreviewProps } from '@/lib/templates'
import { CommandBar } from './CommandBar'
import { TemplateThemeToggle } from './TemplateThemeToggle'

// Command — command-bar-first navigation. A prominent centered command bar is
// the hero of the chrome; the side nav is intentionally understated because the
// palette (⌘K) is the primary way to move around. Minimal, keyboard-forward.
export function CommandTemplate({ contentHtml, title, description, toc }: TemplatePreviewProps) {
  return (
    <div className="tpl tpl-command" data-template="command" data-theme="light">
      <header className="cmd-topbar">
        <a className="cmd-brand" href="#">dewey<span>/docs</span></a>
        <CommandBar />
        <div className="cmd-topbar-right">
          <TemplateThemeToggle className="cmd-icon-btn" />
        </div>
      </header>

      <div className="cmd-body">
        <nav className="cmd-side" aria-label="Docs">
          {sampleNav.map((group) => (
            <div key={group.title} className="cmd-side-group">
              <p className="cmd-side-title">{group.title}</p>
              <ul>
                {group.items.map((item) => (
                  <li key={item.title}>
                    <a href="#" className={item.active ? 'is-active' : ''}>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <main className="cmd-main">
          <article className="cmd-article">
            <h1 className="cmd-title">{title}</h1>
            <p className="cmd-lede">{description}</p>
            <div className="tpl-prose" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </article>

          {toc.length > 0 && (
            <aside className="cmd-toc" aria-label="On this page">
              <p className="cmd-toc-label">On this page</p>
              <ul>
                {toc.map((h) => (
                  <li key={h.id} className={h.depth === 3 ? 'cmd-toc-sub' : ''}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </main>
      </div>
    </div>
  )
}
