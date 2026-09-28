import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import '@/app/site-header.css'
import './contact.css'

export const metadata: Metadata = {
  title: 'Contact — Dewey',
  description: 'Reach the founder behind Dewey — bugs, ideas, and docs questions welcome.',
}

const CHANNELS = [
  {
    href: 'mailto:founder@deweydocs.com',
    label: 'founder@deweydocs.com',
    desc: 'Email — fastest path for anything Dewey',
  },
  {
    href: 'https://github.com/arach',
    label: '@arach on GitHub',
    desc: 'Profile and other projects',
  },
  {
    href: 'https://github.com/arach/dewey/issues',
    label: 'arach/dewey · Issues',
    desc: 'Bugs and feature requests, in the open',
  },
  {
    href: 'https://www.npmjs.com/package/@arach/dewey',
    label: '@arach/dewey on npm',
    desc: 'Package page, versions, and install stats',
  },
]

export default function ContactPage() {
  return (
    <div className="contact-page">
      <SiteHeader showSearch />
      <main className="contact-main">
        <header className="contact-header">
          <p className="contact-eyebrow">Contact</p>
          <h1>Say hello.</h1>
          <p>
            Dewey is built and maintained by <strong>Arach Tchoupani</strong>.
            Questions, bugs, wild ideas about agent-ready docs — all welcome.
          </p>
        </header>

        <ul className="contact-list">
          {CHANNELS.map((channel) => (
            <li key={channel.href}>
              <a href={channel.href} target="_blank" rel="noopener noreferrer">
                <span className="contact-list-label">{channel.label}</span>
                <span className="contact-list-desc">{channel.desc}</span>
              </a>
            </li>
          ))}
        </ul>

        <p className="contact-note">
          Agents welcome too — point them at <a href="/llms.txt">/llms.txt</a>.
        </p>
      </main>
    </div>
  )
}
