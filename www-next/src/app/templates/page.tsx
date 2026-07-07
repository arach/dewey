import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { templateItems, themeItems } from '@/lib/templates'
import '@/app/site-header.css'
import './templates-gallery.css'

export const metadata: Metadata = {
  title: 'Templates & Themes — Dewey',
  description:
    'Structurally distinct documentation layouts for dewey create. Preview each template in light and dark.',
}

export default function TemplatesGalleryPage() {
  return (
    <div className="gallery-page">
      <SiteHeader />

      <main className="gallery-main">
        <header className="gallery-header">
          <p className="gallery-eyebrow">dewey create</p>
          <h1 className="gallery-title">Templates &amp; Themes</h1>
          <p className="gallery-desc">
            Templates define structure — layout, navigation, and density. Themes change
            colors and typography within a template. Preview any option in light or dark.
          </p>
        </header>

        <section className="gallery-section">
          <div className="gallery-section-head">
            <h2>Templates</h2>
            <p>Distinct layouts and navigation patterns</p>
          </div>

          <div className="gallery-grid">
            {templateItems.map((t) => (
              <Link key={t.name} href={`/templates/${t.name}`} className="gallery-card">
                <div className="gallery-frame-wrap">
                  <iframe
                    src={`/templates/${t.name}`}
                    className="gallery-frame"
                    loading="lazy"
                    tabIndex={-1}
                    title={`${t.displayName} template preview`}
                  />
                </div>
                <div className="gallery-info">
                  <h3>{t.displayName}</h3>
                  <p>{t.description}</p>
                  <div className="gallery-badges">
                    {t.badges.map((b) => (
                      <span key={b} className="gallery-badge">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {themeItems.length > 0 && (
          <section className="gallery-section">
            <div className="gallery-section-head">
              <h2>Themes</h2>
              <p>Color and typography variations</p>
            </div>
            <div className="gallery-grid gallery-grid--themes">
              {themeItems.map((t) => (
                <Link key={t.name} href={`/templates/${t.name}`} className="gallery-card">
                  <div className="gallery-swatch" style={{ background: t.bgColor }}>
                    <span className="gallery-swatch-dot" style={{ background: t.primaryColor }} />
                    <span className="gallery-swatch-dark" style={{ background: t.darkBgColor }} />
                  </div>
                  <div className="gallery-info">
                    <h3>{t.displayName}</h3>
                    <p>{t.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
