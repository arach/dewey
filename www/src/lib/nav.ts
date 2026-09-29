import docsIndex from '../../docs.json'

export type NavItem = {
  title: string
  href: string
}

export type NavGroup = {
  id: string
  title: string
  items: NavItem[]
}

interface DocsGroup {
  id: string
  title: string
  items: { id: string; title: string }[]
}

const data = docsIndex as { groups: DocsGroup[] }

const coreItems: NavItem[] = data.groups
  .find((g) => g.id === 'core')
  ?.items.map((item) => ({
    title: item.title,
    href: `/docs/${item.id}`,
  })) ?? []

const referenceItems: NavItem[] = data.groups
  .find((g) => g.id === 'reference')
  ?.items.map((item) => ({
    title: item.title,
    href: `/docs/${item.id}`,
  })) ?? []

const promptItems: NavItem[] = data.groups
  .find((g) => g.id === 'prompts')
  ?.items.map((item) => ({
    title: item.title,
    href: `/docs/${item.id}`,
  })) ?? []

export const navGroups: NavGroup[] = [
  { id: 'core', title: 'Core', items: coreItems },
  { id: 'reference', title: 'Reference', items: referenceItems },
  { id: 'prompts', title: 'Prompts', items: promptItems },
  { id: 'customization', title: 'Customization', items: [{ title: 'Templates', href: '/templates' }] },
  {
    id: 'agent-files',
    title: 'Agent files',
    items: [
      { title: 'AGENTS.md', href: '/AGENTS.md' },
      { title: 'llms.txt', href: '/llms.txt' },
      { title: 'install.md', href: '/install.md' },
    ],
  },
]

export const homeGroups = [
  {
    title: 'Get Started',
    cards: [
      { title: 'Overview', description: 'What Dewey is and how it works.', href: '/docs/overview' },
      { title: 'Quickstart', description: 'Install and generate your first agent files.', href: '/docs/quickstart' },
      { title: 'Skills', description: 'LLM prompt templates for docs review and design critique.', href: '/docs/skills' },
      { title: 'Doc Site Generator', description: 'Scaffold a static Astro site from markdown.', href: '/docs/quickstart#create-a-doc-site' },
      { title: 'Templates', description: 'Browse layout and color themes for your doc site.', href: '/templates' },
    ],
  },
  {
    title: 'Reference',
    cards: [
      { title: 'CLI Reference', description: 'Every command and its options.', href: '/docs/cli' },
      { title: 'API Reference', description: 'TypeScript, React, theme, and artifact contracts.', href: '/docs/api' },
      { title: 'Integrate', description: 'Embed Dewey in an existing React or Next.js app.', href: '/docs/integrate-existing-site' },
      { title: 'Maintenance', description: 'Update, eject, and release generated sites.', href: '/docs/maintenance' },
    ],
  },
  {
    title: 'For AI Agents',
    cards: [
      { title: 'Agent Entry', description: 'Raw markdown endpoints for LLMs.', href: '/agents' },
      { title: 'AGENTS.md', description: 'Combined context with critical rules.', href: '/AGENTS.md' },
      { title: 'llms.txt', description: 'Plain-text project summary.', href: '/llms.txt' },
    ],
  },
  {
    title: 'Generated Files',
    cards: [
      { title: 'install.md', description: 'LLM-executable installation guide.', href: '/install.md' },
      { title: 'Prompt: audit-docs', description: 'Audit docs for completeness.', href: '/docs/prompts/audit-docs' },
      { title: 'Prompt: create-agent-md', description: 'Generate agent-optimized versions.', href: '/docs/prompts/create-agent-md' },
    ],
  },
] as const