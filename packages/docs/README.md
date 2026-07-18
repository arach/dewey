# @arach/dewey

Documentation toolkit for AI-agent-ready docs. Audits, scores, generates retrieval artifacts, and optionally publishes a static docs site.

[![npm](https://img.shields.io/npm/v/@arach/dewey)](https://www.npmjs.com/package/@arach/dewey)
[![license](https://img.shields.io/npm/l/@arach/dewey)](LICENSE)

**[npm](https://www.npmjs.com/package/@arach/dewey)** · **[docs](https://dewey.arach.dev)** · **[github](https://github.com/arach/dewey)**

## What It Does

Dewey is a **docs agent**, not a docs framework. It focuses on preparation and judgment:

| Capability | What you get |
|------------|--------------|
| **Audit** | Validate documentation completeness and quality |
| **Score** | Rate agent-readiness on a 0–100 scale with actionable recommendations |
| **Generate** | `AGENTS.md`, `llms.txt`, `docs.json`, `install.md`, and `agent/` retrieval artifacts |
| **Create** | Optional static doc site from your markdown (Next.js or Astro) |
| **Update** | Refresh Dewey-owned site files to the latest package version |
| **Eject** | Customize layout components without forking the library |
| **Review** | Built-in skills that catch drift between docs and codebase |

## Install

```bash
bun add -d @arach/dewey
```

Or run without installing:

```bash
bunx @arach/dewey@latest <command>
```

## Quick Start

```bash
# Scaffold docs/ and dewey.config.ts
bunx dewey init

# Generate agent-ready files
bunx dewey generate

# Check your agent-readiness score
bunx dewey agent

# Optional: static docs site from markdown
bunx dewey create my-docs --source ./docs --template nextjs --theme ocean
```

## CLI

| Command | Purpose |
|---------|---------|
| `dewey init` | Scaffold `docs/` and `dewey.config.ts` |
| `dewey audit` | Validate documentation completeness |
| `dewey generate` | Create `AGENTS.md`, `llms.txt`, `docs.json`, `install.md`, and `agent/` artifacts |
| `dewey agent` | Score agent-readiness (0–100) with recommendations |
| `dewey create <dir>` | Optional static docs site from markdown |
| `dewey update [dir]` | Update Dewey-owned site files to latest version |
| `dewey eject <component>` | Eject `Header`, `Sidebar`, `TableOfContents`, or `MarkdownContent` |

### Generate options

```bash
dewey generate                          # all outputs
dewey generate --agents-md              # AGENTS.md only
dewey generate --llms-txt               # llms.txt only
dewey generate --docs-json              # docs.json only
dewey generate --install-md             # install.md only (installmd.org)
dewey generate --agent-artifacts        # agent/ retrieval surface only
```

### Agent scoring

```bash
dewey agent              # summary report
dewey agent --verbose    # per-check breakdown
dewey agent --json       # machine-readable output
dewey agent --fix        # auto-create missing files and folders
```

## Generated Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Combined context for AI agents |
| `llms.txt` | Plain text summary for LLMs |
| `docs.json` | Structured documentation manifest (nav, pages, generators) |
| `install.md` | LLM-executable installation guide ([installmd.org](https://installmd.org)) |

The `agent/` retrieval surface (via `--agent-artifacts` or full `generate`):

| File | Purpose |
|------|---------|
| `agent/manifest.json` | Discovery index for docs, prompts, bundles, and raw markdown |
| `agent/docs.json` | Full structured manifest with markdown bodies |
| `agent/prompts.json` | Prompt registry from `docs/prompts/*.md` |
| `agent/context.md` | Compact agent context with retrieval map |
| `agent/context.json` | JSON equivalent for tooling |
| `agent/raw/docs/**.md` | Raw markdown mirror, preserving nested paths |
| `agent/bundles/*.md` | Bundled context for core docs and prompts |

## Programmatic API

### Agent artifacts collector

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

### Configuration

Create `dewey.config.ts` in your project root (scaffolded by `dewey init`):

```ts
export default {
  project: {
    name: 'your-project',
    tagline: 'What your project does',
    type: 'npm-package',
  },
  agent: {
    criticalContext: ['NEVER do X when Y'],
    entryPoints: { main: 'src/' },
  },
  install: {
    objective: 'Install and configure your-project.',
    steps: [{ description: 'Install', command: 'bun add your-project' }],
  },
}
```

## Agent Content Pattern

Each doc page can have two versions:

| Version | Audience | Style |
|---------|----------|-------|
| `page.md` | Humans | Narrative, explanatory |
| `page.agent.md` | AI agents | Dense, structured, self-contained |

Dewey recognizes colocated agent docs (`docs/overview.agent.md`) and nested agent docs (`docs/agent/overview.agent.md`).

## React Components

Optional React components for documentation UIs:

```tsx
import { DocsApp, MarkdownContent, Callout } from '@arach/dewey'
import '@arach/dewey/css'
```

Includes `DocsLayout`, `Sidebar`, `TableOfContents`, `CodeBlock`, `Callout`, `Tabs`, `Steps`, `Card`, `FileTree`, `ApiTable`, `Badge`, `AgentContext`, `PromptSlideout`, and more.

### CSS themes

Import a color theme alongside base styles:

```tsx
import '@arach/dewey/css'
import '@arach/dewey/css/colors/ocean.css'
```

Available themes: `neutral`, `ocean`, `emerald`, `purple`, `dusk`, `rose`, `github`, `warm`, `hudson`, `midnight`, `mono`, `editorial`.

### Tailwind preset

```ts
import deweyPreset from '@arach/dewey/tailwind'
```

## Built-in Skills

Skills are LLM prompt templates exported from the package:

| Skill | Purpose |
|-------|---------|
| `docsReviewAgent` | Review docs quality, catch drift from codebase |
| `docsDesignCritic` | Critique page structure and visual rhythm |
| `promptSlideoutGenerator` | Generate AI-consumable prompt configs |
| `installMdGenerator` | Create LLM-executable `install.md` |

```ts
import { docsReviewAgent, installMdGenerator } from '@arach/dewey'
```

## Site Generator

`dewey create` is a publishing path, not the core contract. The core contract is the generated markdown and JSON artifacts.

```bash
dewey create my-project-docs --source ./docs --template nextjs --theme purple
cd my-project-docs
bun install && bun run dev
```

Templates: `nextjs` (default), `astro`. Themes for scaffolding: `neutral`, `ocean`, `emerald`, `purple`, `dusk`, `rose`, `github`, `warm`, `hudson`.

## License

MIT
