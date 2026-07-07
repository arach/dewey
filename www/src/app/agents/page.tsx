import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import '@/app/site-header.css'
import './agents.css'

export const metadata: Metadata = {
  title: 'Agent Entry — Dewey',
  description: 'Stable URLs for AI agents and tooling — raw text, JSON, and markdown.',
}

const PRIMARY = [
  { path: '/AGENTS.md', label: 'AGENTS.md', desc: 'Combined context for AI coding assistants' },
  { path: '/llms.txt', label: 'llms.txt', desc: 'Plain text project summary' },
  { path: '/install.md', label: 'install.md', desc: 'LLM-executable installation guide' },
  { path: '/lm.txt', label: 'lm.txt', desc: 'Short alias for llms.txt' },
]

const RETRIEVAL = [
  { path: '/agent/manifest.json', label: 'manifest.json', desc: 'Discovery index for docs, prompts, and bundles' },
  { path: '/agent/docs.json', label: 'docs.json', desc: 'Structured docs manifest with markdown bodies' },
  { path: '/agent/prompts.json', label: 'prompts.json', desc: 'Prompt registry from docs/prompts/*.md' },
  { path: '/agent/context.md', label: 'context.md', desc: 'Compact context bundle for agent ingestion' },
  { path: '/agent/context.json', label: 'context.json', desc: 'JSON context bundle for tools' },
  { path: '/agent/bundles/core.md', label: 'bundles/core.md', desc: 'Recommended core reading bundle' },
  { path: '/agent/bundles/prompts.md', label: 'bundles/prompts.md', desc: 'Combined prompt bundle' },
]

export default function AgentsPage() {
  return (
    <div className="agents-page">
      <SiteHeader />
      <main className="agents-main">
        <header className="agents-header">
          <h1>Agent Entry Points</h1>
          <p>
            Dewey serves raw text, JSON, and markdown at stable URLs for AI agents and tooling.
            Human docs live at <Link href="/docs">/docs</Link>.
          </p>
        </header>

        <section className="agents-section">
          <h2>Primary Files</h2>
          <ul className="agents-list">
            {PRIMARY.map((item) => (
              <li key={item.path}>
                <a href={item.path}>{item.label}</a>
                <span>{item.desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="agents-section">
          <h2>Retrieval Surface</h2>
          <ul className="agents-list">
            {RETRIEVAL.map((item) => (
              <li key={item.path}>
                <a href={item.path}>{item.path}</a>
                <span>{item.desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="agents-section">
          <h2>Agent-Optimized Docs</h2>
          <ul className="agents-list">
            <li>
              <a href="/agents/overview.md">/agents/overview.md</a>
              <span>Agent-optimized overview</span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}