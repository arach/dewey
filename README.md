# Dewey

Documentation toolkit for AI-agent-ready docs. Audits, scores, generates optimized documentation, and scaffolds static doc sites.

[![npm](https://img.shields.io/npm/v/@arach/dewey)](https://www.npmjs.com/package/@arach/dewey)
[![license](https://img.shields.io/npm/l/@arach/dewey)](LICENSE)

## What It Does

Dewey is a **docs agent**, not a docs framework. It focuses on preparation and judgment:

- **Audit** — Validate documentation completeness and quality
- **Score** — Rate agent-readiness on a 0-100 scale
- **Generate** — Create AGENTS.md, llms.txt, docs.json, install.md
- **Create** — Scaffold a full static doc site from your markdown (Astro + Pagefind)
- **Review** — Skills that catch drift between docs and codebase

## Installation

```bash
pnpm add -D @arach/dewey
```

Or run directly:

```bash
npx dewey <command>
```

## Quick Start

```bash
# Initialize docs structure
npx dewey init

# Generate agent-ready files
npx dewey generate

# Create a static doc site from your markdown
npx dewey create my-docs --source ./docs --theme ocean

# Check your agent-readiness score
npx dewey agent
```

## CLI Commands

| Command | Purpose |
|---------|---------|
| `dewey init` | Scaffold docs structure + dewey.config.ts |
| `dewey audit` | Validate documentation completeness |
| `dewey generate` | Create AGENTS.md, llms.txt, docs.json, install.md |
| `dewey create` | Scaffold a static Astro doc site from markdown |
| `dewey agent` | Score agent-readiness (0-100 scale) |

## Doc Site Generator

`dewey create` turns a folder of markdown files into a complete static doc site:

```bash
dewey create my-project-docs --source ./docs --theme purple
cd my-project-docs
pnpm install && pnpm dev
```

Features:
- **Astro-based** static output — real HTML, no empty SPA shells
- **Pagefind** search built in
- **8 themes** — neutral, ocean, emerald, purple, dusk, rose, github, warm
- **Dark mode** with system preference detection
- **Auto-navigation** from frontmatter ordering
- **Zero config** — just point it at your markdown

## Generated Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Combined context for AI agents |
| `llms.txt` | Plain text summary for LLMs |
| `docs.json` | Structured documentation metadata |
| `install.md` | LLM-executable installation guide ([installmd.org](https://installmd.org)) |

## Agent Content Pattern

Each doc page can have two versions:

| Version | Audience | Style |
|---------|----------|-------|
| `page.md` | Humans | Narrative, explanatory |
| `page.agent.md` | AI agents | Dense, structured, self-contained |

## Configuration

Create `dewey.config.ts`:

```typescript
export default {
  project: {
    name: 'your-project',
    tagline: 'What your project does',
    type: 'npm-package',
  },
  agent: {
    criticalContext: [
      'NEVER do X when Y',
    ],
    entryPoints: {
      main: 'src/',
    },
  },
  install: {
    objective: 'Install and configure your-project.',
    steps: [
      { description: 'Install', command: 'pnpm add your-project' },
    ],
  },
}
```

## Skills

Skills are LLM prompts that guide agents through specific tasks:

| Skill | Purpose |
|-------|---------|
| `docsReviewAgent` | Review docs quality, catch drift from codebase |
| `docsDesignCritic` | Critique page structure — heading hierarchy, component usage, visual rhythm |
| `promptSlideoutGenerator` | Generate AI-consumable prompt configs |
| `installMdGenerator` | Create LLM-executable installation |

Custom skills go in `.claude/skills/` as markdown files.

## React Components

Dewey includes React components for building documentation UIs:

```tsx
import { DocsApp, MarkdownContent, Callout } from '@arach/dewey'
import '@arach/dewey/css'
```

Components include DocsLayout, Sidebar, TableOfContents, CodeBlock, Callout, Tabs, Steps, Card, FileTree, ApiTable, Badge, AgentContext, PromptSlideout, and more.

## License

MIT
