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
  hash?: string
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
npm install -D @deweydocs/dewey
\`\`\`

Or with pnpm:

\`\`\`bash
pnpm add -D @deweydocs/dewey
\`\`\`

## Quick Setup

Initialize your documentation structure:

\`\`\`bash
npx dewey init
\`\`\`

This creates a \`docs/\` folder and a \`dewey.config.ts\` file:

\`\`\`typescript
import { defineConfig } from '@deweydocs/dewey'

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
import { defineConfig } from '@deweydocs/dewey'

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

const SKILLS_MD = `## Docs Review

The \`docsReviewAgent\` skill walks each page and flags stale sections, missing examples, and drift between the human and agent versions.

\`\`\`bash
dewey skills run docsReviewAgent --page quickstart
\`\`\`

## Design Critic

\`docsDesignCritic\` critiques structure and readability — heading rhythm, paragraph length, scannability — without touching the code.

## install.md

\`installMdGenerator\` produces an [install.md](https://installmd.org)-compatible file: LLM-executable install instructions an agent can follow end to end.

\`\`\`bash
curl -fsSL https://your-project.com/install.md
\`\`\`

## Writing your own

Drop a directory under \`.agents/skills/\` with a \`SKILL.md\` — Dewey picks it up on the next \`generate\` run and lists it in the prompt registry.
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
    skills: {
      id: 'skills',
      title: 'Skills',
      description: 'Built-in LLM prompt skills for docs review, design critique, and install.md generation.',
      markdown: SKILLS_MD,
    },
  },
  nav: [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: 'rocket',
      items: [
        { id: 'getting-started', title: 'Introduction', active: true },
        { id: 'getting-started', title: 'Installation', hash: 'installation' },
        { id: 'getting-started', title: 'Quick Setup', hash: 'quick-setup' },
      ],
    },
    {
      id: 'guides',
      title: 'Guides',
      icon: 'book-open',
      items: [
        { id: 'configuration', title: 'Configuration' },
        { id: 'configuration', title: 'Config File', hash: 'config-file' },
        { id: 'skills', title: 'Skills Overview' },
      ],
    },
    {
      id: 'skills',
      title: 'Skills',
      icon: 'sparkles',
      items: [
        { id: 'skills', title: 'Docs Review', hash: 'docs-review' },
        { id: 'skills', title: 'Design Critic', hash: 'design-critic' },
        { id: 'skills', title: 'Install.md', hash: 'installmd' },
      ],
    },
    {
      id: 'reference',
      title: 'Reference',
      icon: 'code',
      items: [
        { id: 'getting-started', title: 'CLI Commands', hash: 'cli-commands' },
        { id: 'configuration', title: 'Config Options', hash: 'config-file' },
        { id: 'getting-started', title: 'Agent Readiness', hash: 'agent-readiness' },
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
      icon: g.icon,
      items: g.items.map((item) => ({ id: item.id, title: item.title })),
    })),
  }
}