import type { NavigationConfig } from '../../../packages/docs/src/types/page-tree'

export const sampleDocs: Record<string, string> = {
  'getting-started': `# Getting Started

Welcome to **Dewey** — a documentation toolkit that makes your docs AI-agent-ready. Audit, score, and generate optimized documentation for LLM consumption.

## Installation

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

> **Note:** Run \`dewey generate\` after writing your docs to create agent-ready output files.

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

- Read the [Configuration](configuration) guide for advanced setup
- Explore the built-in skills for docs review and improvement
- Check the components library for building doc sites

---

*Built with care by the Dewey team.*
`,

  'configuration': `# Configuration

Fine-tune Dewey's behavior for your project's needs.

## Config File

The \`dewey.config.ts\` file controls all generation options:

\`\`\`typescript
import { defineConfig } from '@arach/dewey'

export default defineConfig({
  name: 'my-project',
  docs: './docs',
  output: {
    agentsMd: true,
    llmsTxt: true,
    installMd: true,
    docsJson: true,
  },
})
\`\`\`

## Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| \`name\` | \`string\` | — | Your project name (required) |
| \`docs\` | \`string\` | \`'./docs'\` | Path to markdown docs directory |
| \`output.agentsMd\` | \`boolean\` | \`true\` | Generate AGENTS.md |
| \`output.llmsTxt\` | \`boolean\` | \`true\` | Generate llms.txt |
| \`output.installMd\` | \`boolean\` | \`true\` | Generate install.md |

## Project Types

Dewey supports different project type presets:

\`\`\`bash
npx dewey init --type npm-package
npx dewey init --type cli-tool
npx dewey init --type react-library
\`\`\`

> **Tip:** Use \`--type\` to get project-specific documentation templates and audit rules.

## Skills

Skills are LLM prompts that guide AI agents through specific tasks. Built-in skills include:

\`\`\`typescript
// Available skills
docsReviewAgent          // Review docs for completeness
promptSlideoutGenerator  // Generate prompt slideout UI
installMdGenerator       // Generate install.md files
docsDesignCritic         // Critique docs site design
improveAiPrompts         // Improve AI prompt quality
\`\`\`

## TypeScript Support

Dewey ships with full TypeScript declarations. The config file uses \`defineConfig\` for type-safe configuration:

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler"
  }
}
\`\`\`
`,
}

export const sampleConfig = {
  name: 'Dewey',
  tagline: 'Documentation toolkit for AI-agent-ready docs',
  basePath: '/docs',
  homeUrl: '/',
  navigation: [
    {
      title: 'Getting Started',
      items: [
        { id: 'getting-started', title: 'Introduction' },
        { id: 'configuration', title: 'Configuration' },
      ],
    },
  ] satisfies NavigationConfig,
}
