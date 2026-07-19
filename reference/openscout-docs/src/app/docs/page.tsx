import Link from 'next/link'
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
            Scout
          </Link>
          <span className="dewey-landing-meta">Docs</span>
        </nav>
        <div style={{ borderTop: '1px solid var(--dewey-border)' }} />

        <header className="dewey-landing-hero">
          <p className="dewey-landing-eyebrow">Documentation</p>
          <h1 className="dewey-landing-title">Scout</h1>
          <p className="dewey-landing-lead">
            Everything you need to run agents locally — from first connection to wire-format details.
          </p>
          {firstDoc && (
            <Link href={`/docs/${firstDoc.id}`} className="dewey-landing-cta">
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
                    href={`/docs/${doc.id}`}
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