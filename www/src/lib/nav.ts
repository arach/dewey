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

export const navGroups: NavGroup[] = [
  ...data.groups.map((group) => ({
    id: group.id,
    title: group.title,
    items: group.items.map((item) => ({ title: item.title, href: `/docs/${item.id}` })),
  })),
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
      { title: 'Overview', description: 'What Dewey does and how its docs loop works.', href: '/docs/overview' },
      { title: 'Quickstart', description: 'Init, author, review, build and check.', href: '/docs/quickstart' },
      { title: 'Skills', description: 'The skill files init writes, and prompt templates.', href: '/docs/skills' },
      { title: 'Docs Site', description: 'dewey build writes a static site to .dewey/site.', href: '/docs/quickstart#5-build' },
      { title: 'Templates', description: 'Layouts and color themes for sites made with the frozen dewey create.', href: '/templates' },
    ],
  },
  {
    title: 'Reference',
    cards: [
      { title: 'CLI Reference', description: 'Every command, its options, and site settings.', href: '/docs/cli' },
      { title: 'API Reference', description: 'TypeScript, React, theme, and artifact contracts.', href: '/docs/api' },
      { title: 'Integrate', description: 'Embed Dewey in an existing React or Next.js app.', href: '/docs/integrate-existing-site' },
      { title: 'Maintenance', description: 'Frozen site commands and release checks.', href: '/docs/maintenance' },
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