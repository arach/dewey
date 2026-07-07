# Core Documentation

| Kind | Title | Source | Raw markdown |
|------|-------|--------|--------------|
| doc | Overview | `docs/overview.md` | /agent/raw/docs/overview.md |
| doc | Quickstart | `docs/quickstart.md` | /agent/raw/docs/quickstart.md |

---

<!-- source: docs/overview.md -->

# Dewey

Dewey is a documentation toolkit that prepares your docs for AI agents. It audits, scores, and exports structured documentation artifacts without requiring a specific rendering framework.

## What Dewey Does

Dewey is a **docs agent**, not a docs framework. It focuses on:

- **Auditing** - Validates documentation completeness and quality
- **Scoring** - Rates agent-readiness on a 0-100 scale
- **Generating** - Creates AGENTS.md, llms.txt, docs.json, install.md, and the `agent/` retrieval surface
- **Exporting** - Publishes recursive raw markdown, manifests, prompt registries, and context bundles
- **Publishing** - Optionally scaffolds a static doc site from your markdown
- **Reviewing** - Skills that catch drift between docs and codebase

## Key Concepts

### Agent Content Pattern

Each documentation page should have two versions:

| Version | Audience | Style |
|---------|----------|-------|
| `.md` | Humans | Narrative, explanatory |
| `.agent.md` | AI agents | Dense, structured, self-contained |

### Skills System

Skills are LLM prompts, not code. Built-in skills:

- `docsReviewAgent` - Reviews docs quality page-by-page
- `docsDesignCritic` - Critiques page structure and visual design
- `promptSlideoutGenerator` - Generates AI-consumable prompt configs
- `installMdGenerator` - Creates install.md following installmd.org

### install.md Standard

Follows the [installmd.org](https://installmd.org) specification. LLM-executable:

```bash
curl https://your-project.com/install.md | claude
```

## CLI Commands

```
dewey init      Create docs/ folder and dewey.config.ts
dewey audit     Check documentation completeness
dewey generate  Create agent-ready files and retrieval artifacts
dewey create    Optional static docs site from markdown
dewey agent     Score agent-readiness (0-100)
```

## Quick Links

- [Quickstart](./quickstart.md) - Get started in 5 minutes
- [CLI Reference](./cli.md) - All commands and options
- [Skills](./skills.md) - Built-in LLM prompt templates

---

<!-- source: docs/quickstart.md -->

# Quickstart

Requires Node.js 18+ and pnpm (recommended) or npm.

### 1. Install

```bash
pnpm add -D @arach/dewey
```

### 2. Initialize

```bash
npx dewey init
```

Creates a `docs/` folder with starter templates and a `dewey.config.ts` configuration file.

### 3. Configure

<div class="doc-file-block">
<div class="doc-file-bar">dewey.config.ts</div>

```typescript
export default {
  project: {
    name: 'your-project',
    tagline: 'What your project does',
    type: 'npm-package', // or cli-tool, react-library, etc.
  },

  agent: {
    criticalContext: [
      // Rules AI agents MUST know
      'NEVER do X when Y',
    ],
    entryPoints: {
      'main': 'src/',
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

</div>

### 4. Write docs

Create pages in the `docs/` folder:

```
docs/
  overview.md          # Project introduction
  quickstart.md        # Getting started guide
  api.md               # API reference
  overview.agent.md    # Agent-optimized version
```

### 5. Generate agent files

```bash
npx dewey generate
```

Outputs `AGENTS.md`, `llms.txt`, `docs.json`, `install.md`, and an `agent/` retrieval surface with raw markdown, prompt registries, manifests, and context bundles.

### 6. Check your score

<div class="doc-file-block">
<div class="doc-file-bar">npx dewey agent</div>

```
Agent Readiness Report
Overall Score: 75/100 (Grade: C)

Categories:
✓ Project Context: 20/25
○ Agent-Optimized Files: 20/30
...
```

</div>

### 7. Optional: create a doc site

```bash
npx dewey create my-docs --source ./docs --theme ocean
cd my-docs && pnpm install && pnpm dev
```

Generates a static docs site from the same markdown when you want a human-facing site alongside the agent artifacts.

---

## Next steps

- Create `.agent.md` versions of your docs for denser, structured content
- Add skills to `.claude/skills/` for custom agent-guided reviews
- Run `npx dewey audit` to check documentation completeness
- Use `dewey create` when you want to publish the same docs as a static site
