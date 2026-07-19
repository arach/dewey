// Unified preview dataset for template gallery + DocsApp theme previews.
// Single source — derive markdown, nav, DocsApp docs map, and active page from here.

export interface PreviewPage {
  id: string
  title: string
  description?: string
  markdown: string
}

export interface PreviewNavItem {
  id: string
  title: string
  active?: boolean
  icon?: string
}

export interface PreviewNavGroup {
  id: string
  title: string
  icon?: string
  items: PreviewNavItem[]
}

export interface PreviewDataset {
  project: { name: string; tagline: string; homeUrl: string }
  activePageId: string
  pages: Record<string, PreviewPage>
  nav: PreviewNavGroup[]
  agentLinks: Array<{ title: string; href?: string }>
}

const GETTING_STARTED_MD = `## Installation

Install the package using your preferred package manager:

\`\`\`bash
npm install -D @arach/dewey
\`\`\`

Or with pnpm:

\`\`\`bash
pnpm add -D @arach/dewey
\`\`\`

## Quick Setup

Initialize your documentation structure:

\`\`\`bash
npx dewey init
\`\`\`

This creates a \`docs/\` folder and a \`dewey.config.ts\` file:

\`\`\`typescript
import { defineConfig } from '@arach/dewey'

export default defineConfig({
  name: 'my-project',
  docs: './docs',
  output: {
    agentsMd: true,
    llmsTxt: true,
    installMd: true,
  },
})
\`\`\`

> **Note:** Never expose your API key in client-side code. Use environment variables or a server-side proxy.

## Core Concepts

Dewey is built around three key ideas:

1. **Agent Content Pattern** — Each page has human (\`.md\`) and agent (\`.agent.md\`) versions
2. **Skills System** — LLM prompts that guide AI agents through specific tasks
3. **install.md Standard** — LLM-executable install instructions following the installmd.org spec

### CLI Commands

| Command | Description |
|---------|-------------|
| \`dewey init\` | Create docs/ folder and config |
| \`dewey audit\` | Check documentation completeness |
| \`dewey generate\` | Create agent-ready files |
| \`dewey agent\` | Score agent-readiness (0-100) |

### Agent Readiness

\`\`\`bash
npx dewey agent
\`\`\`

## What's Next

- Read the Configuration guide for advanced setup
- Explore the built-in skills for docs review and improvement
`

const CONFIGURATION_MD = `## Config File

The \`dewey.config.ts\` file controls generation options:

\`\`\`typescript
import { defineConfig } from '@arach/dewey'

export default defineConfig({
  name: 'my-project',
  docs: './docs',
  output: {
    agentsMd: true,
    llmsTxt: true,
    installMd: true,
  },
})
\`\`\`

## Skills

Built-in skills include \`docsReviewAgent\`, \`installMdGenerator\`, and \`docsDesignCritic\`.
`

export const previewDataset: PreviewDataset = {
  project: {
    name: 'Dewey',
    tagline: 'Documentation toolkit for AI-agent-ready docs',
    homeUrl: '/templates',
  },
  activePageId: 'getting-started',
  pages: {
    'getting-started': {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Welcome to Dewey — a documentation toolkit that makes your docs AI-agent-ready.',
      markdown: GETTING_STARTED_MD,
    },
    configuration: {
      id: 'configuration',
      title: 'Configuration',
      description: 'Fine-tune Dewey behavior for your project.',
      markdown: CONFIGURATION_MD,
    },
  },
  nav: [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: 'rocket',
      items: [
        { id: 'getting-started', title: 'Introduction', active: true },
        { id: 'getting-started', title: 'Installation' },
        { id: 'getting-started', title: 'Quick Setup' },
      ],
    },
    {
      id: 'guides',
      title: 'Guides',
      icon: 'book-open',
      items: [
        { id: 'configuration', title: 'Configuration' },
        { id: 'configuration', title: 'Writing Docs' },
        { id: 'configuration', title: 'Agent Content' },
      ],
    },
    {
      id: 'skills',
      title: 'Skills',
      icon: 'sparkles',
      items: [
        { id: 'getting-started', title: 'Docs Review' },
        { id: 'getting-started', title: 'Design Critic' },
        { id: 'getting-started', title: 'Install.md' },
      ],
    },
    {
      id: 'reference',
      title: 'Reference',
      icon: 'code',
      items: [
        { id: 'getting-started', title: 'CLI Commands' },
        { id: 'configuration', title: 'Config Options' },
        { id: 'getting-started', title: 'Components' },
      ],
    },
  ],
  agentLinks: [
    { title: 'llms.txt' },
    { title: 'llms-full.txt' },
    { title: 'AGENTS.md' },
  ],
}

const active = previewDataset.pages[previewDataset.activePageId]

export const sampleTitle = active.title
export const sampleDescription = active.description ?? ''
export const sampleMarkdown = active.markdown

/** DocsApp-compatible docs map (multi-page). */
export const sampleDocs: Record<string, string> = Object.fromEntries(
  Object.values(previewDataset.pages).map((p) => [
    p.id,
    p.id === 'getting-started'
      ? `# ${p.title}\n\n${p.description}\n\n${p.markdown}`
      : `# ${p.title}\n\n${p.markdown}`,
  ]),
)

export const sampleNav = previewDataset.nav
export const sampleAgentLinks = previewDataset.agentLinks

export function previewDocsAppConfig(basePath: string) {
  return {
    name: previewDataset.project.name,
    tagline: previewDataset.project.tagline,
    basePath,
    homeUrl: previewDataset.project.homeUrl,
    navigation: previewDataset.nav.map((g) => ({
      title: g.title,
      items: g.items.map((item) => ({ id: item.id, title: item.title })),
    })),
  }
}