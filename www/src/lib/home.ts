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
    title: 'Developers',
    cards: [
      {
        title: 'Overview',
        description: 'What Dewey is and how it works.',
        href: '/docs/overview',
      },
      {
        title: 'Quickstart',
        description: 'Get to a working setup in minutes.',
        href: '/docs/quickstart',
      },
      {
        title: 'Skills',
        description: 'Built-in prompts and how to extend them.',
        href: '/docs/skills',
      },
    ],
  },
  {
    title: 'Agents',
    cards: [
      {
        title: 'Agent Entry',
        description: 'Agent-first resources and raw markdown.',
        href: '/agents',
      },
      {
        title: 'AGENTS.md',
        description: 'Combined context for AI agents.',
        href: '/AGENTS.md',
      },
      {
        title: 'llms.txt',
        description: 'Plain-text project summary for LLMs.',
        href: '/llms.txt',
      },
    ],
  },
  {
    title: 'System',
    cards: [
      {
        title: 'install.md',
        description: 'LLM-executable install guide.',
        href: '/install.md',
      },
      {
        title: 'Prompt: audit-docs',
        description: 'Prompt template for auditing docs.',
        href: '/docs/prompts/audit-docs',
      },
      {
        title: 'Prompt: create-agent-md',
        description: 'Prompt template for creating agent files.',
        href: '/docs/prompts/create-agent-md',
      },
    ],
  },
]
