export type HomeCard = {
  title: string
  description: string
  href: string
}

export type HomeGroup = {
  title: string
  cards: HomeCard[]
}

export const homeGroups: HomeGroup[] = [
  {
    title: 'Get Started',
    cards: [
      {
        title: 'Overview',
        description: 'What Dewey is and how it works.',
        href: '/docs/overview',
      },
      {
        title: 'Quickstart',
        description: 'Install and generate your first agent files.',
        href: '/docs/quickstart',
      },
      {
        title: 'Skills',
        description: 'LLM prompt templates for docs review and design critique.',
        href: '/docs/skills',
      },
      {
        title: 'Agent artifacts',
        description: 'Manifest, raw markdown, prompt registry, and context bundles.',
        href: '/agents',
      },
    ],
  },
  {
    title: 'For AI Agents',
    cards: [
      {
        title: 'Agent Entry',
        description: 'Stable retrieval URLs for LLMs and tools.',
        href: '/agents',
      },
      {
        title: 'manifest.json',
        description: 'Discovery index for docs and prompts.',
        href: '/agent/manifest.json',
      },
      {
        title: 'AGENTS.md',
        description: 'Combined context with critical rules.',
        href: '/AGENTS.md',
      },
      {
        title: 'llms.txt',
        description: 'Plain-text project summary.',
        href: '/llms.txt',
      },
    ],
  },
  {
    title: 'Generated Files',
    cards: [
      {
        title: 'install.md',
        description: 'LLM-executable installation guide.',
        href: '/install.md',
      },
      {
        title: 'Prompt: audit-docs',
        description: 'Audit docs for completeness.',
        href: '/docs/prompts/audit-docs',
      },
      {
        title: 'Prompt: create-agent-md',
        description: 'Generate agent-optimized versions.',
        href: '/docs/prompts/create-agent-md',
      },
      {
        title: 'Optional site generator',
        description: 'Publish the same docs as a static site when useful.',
        href: '/docs/quickstart#create-a-doc-site',
      },
    ],
  },
]
