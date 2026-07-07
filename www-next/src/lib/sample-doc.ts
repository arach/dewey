// Sample doc content shared by every template preview. The markdown mirrors
// the production preview so all three layouts render identical content and the
// structural differences are the only thing that changes between them.

export const sampleTitle = 'Getting Started'
export const sampleDescription =
  'Welcome to Dewey — a documentation toolkit that makes your docs AI-agent-ready.'

export const sampleMarkdown = `## Installation

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

Dewey provides these commands:

| Command | Description |
|---------|-------------|
| \`dewey init\` | Create docs/ folder and config |
| \`dewey audit\` | Check documentation completeness |
| \`dewey generate\` | Create agent-ready files |
| \`dewey agent\` | Score agent-readiness (0-100) |

### Agent Readiness

Check how well your docs serve AI agents:

\`\`\`bash
npx dewey agent
\`\`\`

This scores your documentation from 0-100 and provides actionable recommendations to improve agent compatibility.

## What's Next

- Read the [Configuration](#) guide for advanced setup
- Explore the built-in skills for docs review and improvement
- Check the components library for building doc sites
`

// ─── Navigation model shared across templates ────────────────────────
// `icon` keys map to lucide icons in the Rail template; other templates
// ignore them and render the group titles / items as text.

export interface SampleNavItem {
  title: string
  active?: boolean
}

export interface SampleNavGroup {
  title: string
  icon: string
  items: SampleNavItem[]
}

export const sampleNav: SampleNavGroup[] = [
  {
    title: 'Getting Started',
    icon: 'rocket',
    items: [
      { title: 'Introduction', active: true },
      { title: 'Installation' },
      { title: 'Quick Setup' },
    ],
  },
  {
    title: 'Guides',
    icon: 'book-open',
    items: [
      { title: 'Configuration' },
      { title: 'Writing Docs' },
      { title: 'Agent Content' },
    ],
  },
  {
    title: 'Skills',
    icon: 'sparkles',
    items: [
      { title: 'Docs Review' },
      { title: 'Design Critic' },
      { title: 'Install.md' },
    ],
  },
  {
    title: 'Reference',
    icon: 'code',
    items: [
      { title: 'CLI Commands' },
      { title: 'Config Options' },
      { title: 'Components' },
    ],
  },
]

// Flat top-level entries for the command palette / top nav.
export const sampleAgentLinks = [
  { title: 'llms.txt' },
  { title: 'llms-full.txt' },
  { title: 'AGENTS.md' },
]
