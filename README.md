# Dewey

Documentation toolkit for AI-agent-ready docs. Audits, scores, and generates optimized documentation for LLM consumption.

## What It Does

Dewey is a **docs agent**, not a docs framework. It focuses on preparation and judgment:

- **Audit** - Validate documentation completeness and quality
- **Score** - Rate agent-readiness on a 0-100 scale
- **Generate** - Create AGENTS.md, llms.txt, docs.json, install.md
- **Review** - Skills that catch drift between docs and codebase

## Installation

```bash
pnpm add -D @arach/dewey
```

## Quick Start

```bash
# Initialize docs structure
npx dewey init

# Generate agent-ready files
npx dewey generate

# Check your score
npx dewey agent
```

## CLI Commands

| Command | Purpose |
|---------|---------|
| `dewey init` | Scaffold docs structure + dewey.config.ts |
| `dewey audit` | Validate documentation completeness |
| `dewey generate` | Create AGENTS.md, llms.txt, docs.json, install.md |
| `dewey agent` | Score agent-readiness (0-100 scale) |

## Generated Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Combined context for AI agents |
| `llms.txt` | Plain text summary for LLMs |
| `docs.json` | Structured documentation |
| `install.md` | LLM-executable installation guide ([installmd.org](https://installmd.org)) |

## Agent Content Pattern

Each doc page should have two versions:

| Version | Audience | Style |
|---------|----------|-------|
| `.md` | Humans | Narrative, explanatory |
| `.agent.md` | AI agents | Dense, structured, self-contained |

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
| `promptSlideoutGenerator` | Generate AI-consumable prompt configs |
| `installMdGenerator` | Create LLM-executable installation |

Custom skills go in `.claude/skills/` as markdown files.

## React Components

Dewey includes 22 React components for building documentation sites:

```tsx
import { DocsApp, MarkdownContent, Callout } from '@arach/dewey'
import '@arach/dewey/css'
```

Components include: DocsLayout, Sidebar, TableOfContents, CodeBlock, Callout, Tabs, Steps, Card, FileTree, ApiTable, Badge, AgentContext, PromptSlideout, and more.

## Documentation

See the [docs site](https://dewey.arach.io) for full documentation.

## License

MIT
