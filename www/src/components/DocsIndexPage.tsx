import Link from 'next/link'
import { homeGroups } from '@/lib/nav'

export function DocsIndexPage() {
  return (
    <div className="dl-content-wrap">
      <div className="dl-page-header">
        <div className="dl-page-header-text">
          <h1 className="dl-page-title">Documentation</h1>
        </div>
      </div>

      <article className="dl-content">
        <div className="dl-home">
          {homeGroups.map((group) => (
            <div key={group.title}>
              <h2 className="dl-home-group-title">{group.title}</h2>
              <div className="dl-home-grid">
                {group.cards.map((card) => (
                  <Link key={card.href} href={card.href} className="dl-home-card">
                    <div>
                      <h3 className="dl-home-card-title">{card.title}</h3>
                      <p className="dl-home-card-desc">{card.description}</p>
                    </div>
                    <p className="dl-home-card-cta">
                      Learn more
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}