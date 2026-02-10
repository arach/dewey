import { Link } from 'react-router-dom'
import { BookOpen, Terminal, FileText, CheckCircle, ArrowRight, Github, Copy, Check } from 'lucide-react'
import { useState } from 'react'

function InstallCommand() {
  const [copied, setCopied] = useState(false)
  const command = 'pnpm add @arach/dewey'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="relative group"
      style={{
        background: '#0c1416',
        borderRadius: '12px',
        boxShadow: '0 18px 30px rgba(12, 20, 22, 0.3)',
      }}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <code
          className="text-[14px]"
          style={{ fontFamily: 'var(--font-mono)', color: '#abb2bf' }}
        >
          <span style={{ color: '#5c6370' }}>$</span>
          <span style={{ color: '#98c379' }}> {command}</span>
        </code>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-all"
          style={{
            color: copied ? '#10b981' : 'rgba(255,255,255,0.4)',
            background: copied ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
          }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

export function Landing() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--arc-paper)' }}
    >
      {/* Animated background glow */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute w-[800px] h-[800px] rounded-full animate-glow"
          style={{
            background: 'radial-gradient(circle, var(--arc-glow) 0%, transparent 70%)',
            top: '-200px',
            right: '-200px',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full animate-glow"
          style={{
            background: 'radial-gradient(circle, rgba(31, 122, 101, 0.15) 0%, transparent 70%)',
            bottom: '-100px',
            left: '-100px',
            filter: 'blur(60px)',
            animationDelay: '2s',
          }}
        />
      </div>

      {/* Nav */}
      <nav
        className="sticky top-0 z-50"
        style={{
          backdropFilter: 'blur(12px)',
          background: 'rgba(247, 243, 236, 0.85)',
          borderBottom: '1px solid var(--arc-border)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--arc-accent)',
                boxShadow: '0 0 0 3px var(--arc-glow)',
              }}
            />
            <span
              className="text-lg font-semibold font-serif"
              style={{ color: 'var(--arc-ink)' }}
            >
              Dewey
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              to="/docs"
              className="text-[13px] font-medium transition-colors px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--arc-ink-soft)' }}
            >
              Docs
            </Link>
            <a
              href="https://github.com/arach/dewey"
              className="flex items-center gap-2 text-[13px] font-medium px-3 py-1.5 rounded-lg border transition-colors"
              style={{
                color: 'var(--arc-ink)',
                borderColor: 'var(--arc-border)',
                background: 'rgba(255, 255, 255, 0.5)',
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-[12px] font-medium"
            style={{
              background: 'rgba(31, 122, 101, 0.1)',
              color: 'var(--arc-accent-2)',
              border: '1px solid rgba(31, 122, 101, 0.2)',
            }}
          >
            <FileText className="w-3.5 h-3.5" />
            Agent-ready documentation
          </div>

          <h1
            className="text-4xl md:text-5xl font-semibold mb-6 font-serif leading-tight"
            style={{
              color: 'var(--arc-ink)',
              letterSpacing: '-0.02em',
            }}
          >
            Documentation that works for{' '}
            <span style={{ color: 'var(--arc-accent)' }}>humans</span>{' '}
            <span style={{ color: 'var(--arc-muted)' }}>&</span>{' '}
            <span style={{ color: 'var(--arc-accent-2)' }}>AI</span>
          </h1>

          <p
            className="text-lg mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ color: 'var(--arc-muted)' }}
          >
            A documentation toolkit that helps you build beautiful docs sites
            and generates agent-ready files like AGENTS.md and llms.txt.
          </p>

          <div className="flex items-center justify-center gap-3 mb-12">
            <Link
              to="/docs/quickstart"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium transition-all hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--arc-accent), #f2a071)',
                color: '#1c120a',
                boxShadow: '0 8px 20px rgba(240, 124, 79, 0.25)',
              }}
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/arach/dewey"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium border transition-colors"
              style={{
                borderColor: 'var(--arc-border)',
                color: 'var(--arc-ink)',
                background: 'rgba(255, 255, 255, 0.6)',
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Source
            </a>
          </div>

          {/* Install command */}
          <div className="max-w-md mx-auto">
            <InstallCommand />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-2xl font-semibold mb-3 font-serif"
              style={{ color: 'var(--arc-ink)' }}
            >
              One package, everything you need
            </h2>
            <p style={{ color: 'var(--arc-muted)' }}>
              CLI tools and React components in a single{' '}
              <code
                className="px-2 py-0.5 rounded text-[13px]"
                style={{
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(0,0,0,0.06)',
                }}
              >
                @arach/dewey
              </code>{' '}
              package.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* CLI */}
            <div
              className="rounded-2xl p-7 transition-all hover:shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid var(--arc-border)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(31, 122, 101, 0.15)' }}
              >
                <Terminal className="w-5 h-5" style={{ color: 'var(--arc-accent-2)' }} />
              </div>
              <h3
                className="text-lg font-semibold mb-2 font-serif"
                style={{ color: 'var(--arc-ink)' }}
              >
                CLI Tools
              </h3>
              <p
                className="text-[14px] mb-5 leading-relaxed"
                style={{ color: 'var(--arc-muted)' }}
              >
                Scaffold, audit, and generate agent-ready documentation files
                from the command line.
              </p>
              <ul className="space-y-2.5">
                {[
                  'npx dewey init → scaffold docs',
                  'npx dewey audit → validate completeness',
                  'npx dewey generate → create AGENTS.md',
                  'Configurable via dewey.config.ts',
                ].map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-[13px]"
                    style={{ color: 'var(--arc-ink-soft)' }}
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--arc-accent-2)' }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Components */}
            <div
              className="rounded-2xl p-7 transition-all hover:shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid var(--arc-border)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(240, 124, 79, 0.15)' }}
              >
                <BookOpen className="w-5 h-5" style={{ color: 'var(--arc-accent)' }} />
              </div>
              <h3
                className="text-lg font-semibold mb-2 font-serif"
                style={{ color: 'var(--arc-ink)' }}
              >
                React Components
              </h3>
              <p
                className="text-[14px] mb-5 leading-relaxed"
                style={{ color: 'var(--arc-muted)' }}
              >
                Beautiful docs components. Layouts, code blocks,
                callouts, tabs, and more.
              </p>
              <ul className="space-y-2.5">
                {[
                  'Dark mode & responsive design',
                  'Syntax highlighting',
                  'Auto table of contents',
                  'Copy for Agent feature',
                ].map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-[13px]"
                    style={{ color: 'var(--arc-ink-soft)' }}
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--arc-accent-2)' }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Generated files */}
      <section
        className="relative z-10 py-20 px-6"
        style={{ background: 'rgba(255, 255, 255, 0.4)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-2xl font-semibold mb-3 font-serif"
              style={{ color: 'var(--arc-ink)' }}
            >
              Generated agent files
            </h2>
            <p style={{ color: 'var(--arc-muted)' }}>
              Run{' '}
              <code
                className="px-2 py-0.5 rounded text-[13px]"
                style={{
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(0,0,0,0.06)',
                }}
              >
                dewey generate
              </code>{' '}
              to create files optimized for AI agents.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: 'AGENTS.md',
                description: 'Combined docs with critical context, entry points, and navigation rules for AI coding assistants.',
              },
              {
                title: 'llms.txt',
                description: 'Plain text format following the llms.txt convention for broad LLM compatibility.',
              },
              {
                title: 'docs.json',
                description: 'Structured JSON for programmatic access and custom integrations.',
              },
            ].map((file, i) => (
              <div
                key={i}
                className="rounded-xl p-5 transition-all hover:shadow-md"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid var(--arc-border)',
                }}
              >
                <FileText
                  className="w-7 h-7 mb-3"
                  style={{ color: 'var(--arc-muted)' }}
                />
                <h3
                  className="font-semibold mb-1.5 font-serif"
                  style={{ color: 'var(--arc-ink)' }}
                >
                  {file.title}
                </h3>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: 'var(--arc-muted)' }}
                >
                  {file.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2
            className="text-2xl font-semibold mb-4 font-serif"
            style={{ color: 'var(--arc-ink)' }}
          >
            Ready to get started?
          </h2>
          <p
            className="mb-8"
            style={{ color: 'var(--arc-muted)' }}
          >
            Install Dewey and have agent-ready documentation in minutes.
          </p>
          <Link
            to="/docs/quickstart"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium transition-all hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--arc-accent), #f2a071)',
              color: '#1c120a',
              boxShadow: '0 8px 20px rgba(240, 124, 79, 0.25)',
            }}
          >
            Read the Quickstart
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 py-8 px-6"
        style={{ borderTop: '1px solid var(--arc-border)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-[13px]"
            style={{ color: 'var(--arc-muted)' }}
          >
            Named after Melvil Dewey, creator of the Dewey Decimal System
          </p>
          <div className="flex items-center gap-5">
            <Link
              to="/docs"
              className="text-[13px] transition-colors"
              style={{ color: 'var(--arc-muted)' }}
            >
              Docs
            </Link>
            <a
              href="https://github.com/arach/dewey"
              className="text-[13px] transition-colors"
              style={{ color: 'var(--arc-muted)' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
