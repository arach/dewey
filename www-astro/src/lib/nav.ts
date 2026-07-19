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

const coreItems: NavItem[] = docsIndex.sections.map((section) => ({
  title: section.title,
  href: `/docs/${section.id}`,
}))

const promptItems: NavItem[] = [
  { title: 'Create agent.md', href: '/docs/prompts/create-agent-md' },
  { title: 'Audit docs', href: '/docs/prompts/audit-docs' },
]

export const navGroups: NavGroup[] = [
  { id: 'core', title: 'Core', items: coreItems },
  { id: 'prompts', title: 'Prompts', items: promptItems },
]
