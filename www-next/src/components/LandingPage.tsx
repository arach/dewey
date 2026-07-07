'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import '@/app/site-header.css'
import '@/app/landing-v3.css'

const PKG_COMMANDS: Record<string, string> = {
  bun: 'bun add @arach/dewey',
  npm: 'npm install @arach/dewey',
  pnpm: 'pnpm add @arach/dewey',
  yarn: 'yarn add @arach/dewey',
  npx: 'npx dewey init',
}

const PKG_TABS = ['bun', 'npm', 'pnpm', 'yarn', 'npx'] as const

const FEATURES = [
  {
    icon: (
      <svg className="v3-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
    title: 'CLI Toolkit',
    desc: 'Scaffold, audit, and generate agent-ready files from the command line',
    href: '/docs/quickstart',
  },
  {
    icon: (
      <svg className="v3-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Doc Site Generator',
    desc: 'Turn markdown into a complete static site with search, themes, and dark mode',
    href: '/docs/quickstart#create-a-doc-site',
  },
  {
    icon: (
      <svg className="v3-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: 'Agent-Ready Files',
    desc: 'Generate AGENTS.md, llms.txt, and install.md for AI coding assistants',
    href: '/docs/overview',
  },
  {
    icon: (
      <svg className="v3-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'Readiness Scoring',
    desc: 'Audit docs against a 100-point rubric with grades and recommendations',
    href: '/docs/skills',
  },
] as const

const FILES = [
  { name: 'AGENTS.md', desc: 'Combined docs with critical context, entry points, and navigation rules for AI coding assistants.' },
  { name: 'llms.txt', desc: 'Plain text format following the llms.txt convention for broad LLM compatibility.' },
  { name: 'install.md', desc: 'LLM-executable installation guide following the installmd.org specification.' },
] as const

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

function RotatingWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (words.length < 2) return
    const id = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length)
        setFading(false)
      }, 450)
    }, 3500)
    return () => clearInterval(id)
  }, [words])

  return (
    <em className={`v3-rotate${fading ? ' fading' : ''}`} style={{ fontStyle: 'italic' }}>
      {words[index]}
    </em>
  )
}

export function LandingPage() {
  const [activePkg, setActivePkg] = useState<(typeof PKG_TABS)[number]>('bun')
  const [copyLabel, setCopyLabel] = useState('Copy')
  const [agentView, setAgentView] = useState(false)

  const installCmd = PKG_COMMANDS[activePkg]

  const copyInstall = useCallback(async () => {
    await navigator.clipboard.writeText(installCmd)
    setCopyLabel('Copied!')
    setTimeout(() => setCopyLabel('Copy'), 2000)
  }, [installCmd])

  useEffect(() => {
    document.body.style.overflow = agentView ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [agentView])

  return (
    <>
      <SiteHeader showSearch={false} />

      <div className="v3">
        <section className="v3-hero">
          <div className="v3-hero-inner">
            <div className="v3-hero-grid">
              <div>
                <h1>
                  Curated docs
                  <br />
                  for <RotatingWord words={['agents.', 'devs.']} />
                </h1>
                <p className="v3-hero-desc">
                  Audit, score, and generate agent-ready documentation.
                  <br />
                  Scaffold complete static doc sites from your markdown.
                </p>

                <div className="v3-hero-install">
                  <div className="v3-pkg-tabs">
                    {PKG_TABS.map((pkg) => (
                      <button
                        key={pkg}
                        type="button"
                        className={`v3-pkg-tab${activePkg === pkg ? ' active' : ''}`}
                        onClick={() => setActivePkg(pkg)}
                      >
                        {pkg}
                      </button>
                    ))}
                  </div>
                  <div className="v3-pkg-cmd">
                    <code>
                      $ <strong>{installCmd}</strong>
                    </code>
                    <button type="button" className="v3-hero-install-copy" onClick={copyInstall}>
                      <span>{copyLabel}</span>
                    </button>
                  </div>
                </div>

                <div className="v3-hero-actions">
                  <Link href="/docs" className="v3-btn-light">
                    View Docs
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <a href="https://github.com/arach/dewey" className="v3-btn-ghost" target="_blank" rel="noopener noreferrer">
                    View Source
                  </a>
                </div>
              </div>

              <div className="v3-hero-right">
                <div className="v3-install-terminal">
                  <div className="v3-terminal-bar">
                    <span className="v3-terminal-dot" />
                    <span className="v3-terminal-dot" />
                    <span className="v3-terminal-dot" />
                    <span className="v3-terminal-title">~/my-project</span>
                  </div>
                  <div className="v3-terminal-lines">
                    <div className="v3-terminal-line">
                      <span className="v3-terminal-prompt">$</span>
                      <span>bunx dewey init</span>
                    </div>
                    <div className="v3-terminal-line v3-terminal-output">→ Created docs/overview.md</div>
                    <div className="v3-terminal-line v3-terminal-output">→ Created dewey.config.ts</div>
                    <div className="v3-terminal-line" style={{ marginTop: 8 }}>
                      <span className="v3-terminal-prompt">$</span>
                      <span>bunx dewey generate</span>
                    </div>
                    <div className="v3-terminal-line v3-terminal-output">→ AGENTS.md</div>
                    <div className="v3-terminal-line v3-terminal-output">→ llms.txt</div>
                    <div className="v3-terminal-line v3-terminal-output">→ install.md</div>
                    <div className="v3-terminal-line" style={{ marginTop: 8 }}>
                      <span className="v3-terminal-prompt">$</span>
                      <span>bunx dewey audit</span>
                    </div>
                    <div className="v3-terminal-line v3-terminal-output">Score: 92/100 — Grade: A</div>
                    <div className="v3-terminal-line v3-terminal-output">✓ AGENTS.md present</div>
                    <div className="v3-terminal-line v3-terminal-output">✓ llms.txt present</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="v3-section" style={{ paddingBottom: 0 }}>
          <div className="v3-section-header">
            <div>
              <p className="v3-section-label">Capabilities</p>
              <h2 className="v3-section-title">
                One package,
                <br />
                everything you need.
              </h2>
            </div>
          </div>
        </section>

        <div className="v3-features-wrap">
          <div className="v3-features-lines">
            <div className="v3-hline v3-hline-top" />
            <div className="v3-hline v3-hline-mid" />
            <div className="v3-hline v3-hline-bot" />
            <div className="v3-vline v3-vline-left" />
            <div className="v3-vline v3-vline-center" />
            <div className="v3-vline v3-vline-right" />
          </div>
          <div className="v3-features-dots">
            <span className="v3-dot v3-dot-tl" />
            <span className="v3-dot v3-dot-tr" />
            <span className="v3-dot v3-dot-bl" />
            <span className="v3-dot v3-dot-br" />
            <span className="v3-dot v3-dot-tc" />
            <span className="v3-dot v3-dot-bc" />
            <span className="v3-dot v3-dot-cl" />
            <span className="v3-dot v3-dot-cr" />
            <span className="v3-dot v3-dot-cc" />
          </div>
          <div className="v3-features">
            {FEATURES.map((f) => (
              <div key={f.title} className="v3-feature">
                <div className="v3-feature-top">
                  {f.icon}
                  <h3>{f.title}</h3>
                </div>
                <p>{f.desc}</p>
                <Link href={f.href} className="v3-feature-link">
                  Learn more
                  <ArrowIcon />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <section className="v3-section" style={{ paddingBottom: 0 }}>
          <div className="v3-section-header">
            <div>
              <p className="v3-section-label">Output</p>
              <h2 className="v3-section-title">
                Generated
                <br />
                agent files.
              </h2>
            </div>
          </div>
        </section>

        <div className="v3-files-wrap">
          <div className="v3-files">
            {FILES.map((file) => (
              <div key={file.name} className="v3-file">
                <p className="v3-file-name">{file.name}</p>
                <p className="v3-file-desc">{file.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="v3-cta">
          <h2>
            Crafted docs
            <br />
            for <RotatingWord words={['devs.', 'agents.']} />
          </h2>
          <p>Agent-ready documentation in minutes.</p>
          <Link href="/docs/quickstart" className="v3-btn-light" style={{ position: 'relative' }}>
            Read the Quickstart
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

        <footer className="v3-footer">
          <span className="v3-footer-note">
            Named after Melvil Dewey, creator of the Dewey Decimal System. Made with ❤️ by{' '}
            <a href="https://github.com/arach" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--s-text-muted)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
              arach
            </a>
          </span>
          <div className="v3-footer-links">
            <Link href="/docs">Docs</Link>
            <a href="https://www.npmjs.com/package/@arach/dewey" target="_blank" rel="noopener noreferrer">
              npm
            </a>
            <a href="https://github.com/arach/dewey" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </footer>

        <button
          type="button"
          className="v3-agent-toggle"
          onClick={() => setAgentView((v) => !v)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span className="v3-agent-toggle-label">
            Agent view
            <span className={`v3-agent-toggle-pip${agentView ? ' active' : ''}`} />
          </span>
        </button>

        <div className={`v3-agent-view${agentView ? ' active' : ''}`}>
          <aside className="v3-agent-sidebar">
            <div className="v3-agent-logo">
              dewey <span>/ agent</span>
            </div>
            <nav className="v3-agent-nav-group">
              <p className="v3-agent-nav-label">Pages</p>
              <Link href="/docs" className="v3-agent-nav-item">
                <span>/docs</span>
              </Link>
              <Link href="/docs/quickstart" className="v3-agent-nav-item">
                <span>/quickstart</span>
              </Link>
              <Link href="/docs/overview" className="v3-agent-nav-item">
                <span>/overview</span>
              </Link>
            </nav>
            <nav className="v3-agent-nav-group">
              <p className="v3-agent-nav-label">Agent files</p>
              <a href="/AGENTS.md" className="v3-agent-nav-item">
                <span>AGENTS.md</span>
              </a>
              <a href="/llms.txt" className="v3-agent-nav-item">
                <span>llms.txt</span>
              </a>
              <a href="/install.md" className="v3-agent-nav-item">
                <span>install.md</span>
              </a>
            </nav>
          </aside>
          <main className="v3-agent-main">
            <h1>dewey</h1>
            <p className="v3-agent-tagline">
              Documentation toolkit for AI-agent-ready docs. Audit, score, and generate optimized documentation.
            </p>
            <div className="v3-agent-install">
              <code>
                $ <strong>{installCmd}</strong>
              </code>
              <button type="button" onClick={copyInstall}>
                copy
              </button>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}