# Dewey

Documentation toolkit for AI-agent-ready docs. Audits, scores, generates retrieval artifacts, and can publish a static docs site when useful.

[![npm](https://img.shields.io/npm/v/@arach/dewey)](https://www.npmjs.com/package/@arach/dewey)
[![npm downloads](https://img.shields.io/npm/dm/@arach/dewey)](https://www.npmjs.com/package/@arach/dewey)
[![license](https://img.shields.io/npm/l/@arach/dewey)](LICENSE)

**[npm](https://www.npmjs.com/package/@arach/dewey)** · **[docs](https://dewey.arach.dev)** · **[github](https://github.com/arach/dewey)**

## What It Does

Dewey is a **docs agent**, not a docs framework. It focuses on preparation and judgment:

- **Audit** — Validate documentation completeness and quality
- **Score** — Rate agent-readiness on a 0-100 scale
- **Generate** — Create AGENTS.md, llms.txt, docs.json, install.md, and agent retrieval artifacts
- **Create** — Optionally scaffold a static doc site from your markdown
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

# Optional: create a static doc site from your markdown
npx dewey create my-docs --source ./docs --theme ocean

# Check your agent-readiness score
npx dewey agent
```

## CLI Commands

| Command | Purpose |
|---------|---------|
| `dewey init` | Scaffold docs structure + dewey.config.ts |
| `dewey audit` | Validate documentation completeness |
| `dewey generate` | Create AGENTS.md, llms.txt, docs.json, install.md, and `agent/` artifacts |
| `dewey create` | Optional static docs site from markdown |
| `dewey agent` | Score agent-readiness (0-100 scale) |

## Optional Site Generator

`dewey create` turns a folder of markdown files into a static doc site when you want a human-facing website alongside the agent artifacts:

```bash
dewey create my-project-docs --source ./docs --theme purple
cd my-project-docs
pnpm install && pnpm dev
```

It is a publishing path, not the core contract. The core contract is the generated markdown and JSON artifacts.

## Generated Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Combined context for AI agents |
| `llms.txt` | Plain text summary for LLMs |
| `docs.json` | Structured documentation metadata |
| `install.md` | LLM-executable installation guide ([installmd.org](https://installmd.org)) |

Plain `dewey generate` also emits an `agent/` retrieval surface inspired by
the Lattices docs migration:

| File | Purpose |
|------|---------|
| `agent/manifest.json` | Discovery index for docs, prompts, bundles, and raw markdown |
| `agent/docs.json` | Full structured manifest with markdown bodies |
| `agent/prompts.json` | Prompt registry from `docs/prompts/*.md` |
| `agent/context.md` | Compact agent context with retrieval map and bundled docs |
| `agent/context.json` | JSON equivalent for tooling |
| `agent/raw/docs/**.md` | Raw markdown mirror, preserving nested paths |
| `agent/bundles/core.md` | Overview/quickstart/core docs bundle when present |
| `agent/bundles/prompts.md` | Combined prompt bundle |

Generate only this surface with:

```bash
dewey generate --agent-artifacts
```

Node agents and site build scripts can reuse the collector directly:

```ts
import {
  collectMarkdownArtifacts,
  getMarkdownArtifact,
  getPromptArtifact,
  buildAgentManifest,
  buildPromptRegistry,
  buildContextBundle,
  writeAgentArtifacts,
} from '@arach/dewey/agent-artifacts'
```

## Agent Content Pattern

Each doc page can have two versions:

| Version | Audience | Style |
|---------|----------|-------|
| `page.md` | Humans | Narrative, explanatory |
| `page.agent.md` | AI agents | Dense, structured, self-contained |

Dewey recognizes both colocated agent docs like `docs/overview.agent.md` and nested agent docs like `docs/agent/overview.agent.md`.

`docs.json` is also now a richer manifest, not just a nav blob. It includes:

- `groups` for navigation
- `pages` for page-level metadata and source paths
- `generators.dewey` for explicit ownership, lifecycle, and generated outputs

That makes it safe for downstream tooling like OG generators to consume the docs graph declaratively.

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
