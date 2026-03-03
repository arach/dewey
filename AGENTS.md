# dewey

> Documentation toolkit for AI-agent-ready docs

## Critical Context

**IMPORTANT:** Read these rules before making any changes:

- Dewey is a docs AGENT, not a docs framework - focus on preparation and judgment, not presentation
- Skills are LLM prompts, not deterministic code - they guide agents
- Each doc page should have TWO versions: .md for humans, .agent.md for AI agents
- Agent versions should be dense, structured, self-contained - prefer tables over prose
- The www/ folder is a reference implementation only - do not invest in UI polish

## Project Structure

| Component | Path | Purpose |
|-----------|------|---------|
| Cli | `packages/docs/src/cli/` | |
| Components | `packages/docs/src/components/` | |
| Skills | `.claude/skills/` | |

## Quick Navigation

- Working with **cli**? → Check packages/docs/src/cli/ for CLI commands
- Working with **component**? → Check packages/docs/src/components/ for React components
- Working with **skill**? → Check .claude/skills/ for LLM prompt templates
- Working with **config**? → Check dewey.config.ts for project configuration

## Overview

> Documentation toolkit for AI-agent-ready docs

# Dewey

Dewey is a documentation toolkit that makes your docs AI-agent-ready. It audits, scores, and generates optimized documentation for LLM consumption.

## What Dewey Does

Dewey is a **docs agent**, not a docs framework. It focuses on:

- **Auditing** - Validates documentation completeness and quality
- **Scoring** - Rates agent-readiness on a 0-100 scale
- **Generating** - Creates AGENTS.md, llms.txt, docs.json, install.md
- **Creating** - Scaffolds static Astro doc sites from your markdown
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
dewey generate  Create agent-ready files
dewey create    Scaffold a static Astro doc site from markdown
dewey agent     Score agent-readiness (0-100)
```

## Quick Links

- [Quickstart](./quickstart.md) - Get started in 5 minutes
- [CLI Reference](./cli.md) - All commands and options
- [Skills](./skills.md) - Built-in LLM prompt templates

## Quickstart

> Get your documentation agent-ready in under 5 minutes

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

Outputs `AGENTS.md`, `llms.txt`, `docs.json`, and `install.md` — everything an AI agent needs to understand your project.

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

### 7. Create a doc site

```bash
npx dewey create my-docs --source ./docs --theme ocean
cd my-docs && pnpm install && pnpm dev
```

Generates a full static site with Astro, Pagefind search, color themes, dark mode, and auto-navigation from frontmatter.

---

## Next steps

- Create `.agent.md` versions of your docs for denser, structured content
- Add skills to `.claude/skills/` for custom agent-guided reviews
- Run `npx dewey audit` to check documentation completeness
- Browse [templates](/templates) to pick a theme for your doc site

## Skills

> Expert instructions that guide AI agents through specific documentation tasks

Skills are LLM prompts, not code. They're expert instructions that tell AI agents exactly how to perform a task — what to check, what to produce, and what success looks like.

## Built-in Skills

| Skill | Purpose | Usage |
|-------|---------|-------|
| `docsReviewAgent` | Reviews doc quality page-by-page — catches stale content, missing sections, unclear explanations, broken links | `Use the docsReviewAgent skill to review docs/overview.md` |
| `promptSlideoutGenerator` | Generates AI-consumable prompt configurations for documentation pages | `Use promptSlideoutGenerator to create prompt config for the API page` |
| `docsDesignCritic` | Critiques page structure and visual design — heading hierarchy, component usage, information density | `Use docsDesignCritic to critique docs/quickstart.md` |
| `installMdGenerator` | Creates install.md files following the [installmd.org](https://installmd.org) spec | `Use installMdGenerator to create install.md from dewey.config.ts` |

---

## Creating Custom Skills

Skills live as markdown files in your project:

```
.claude/skills/
  my-skill.md
```

Each skill follows a consistent structure:

<div class="doc-file-block">
<div class="doc-file-bar">my-skill.md</div>

```markdown
# Skill Name

Brief description of what this skill does.

## When to Use

- Situation 1
- Situation 2

## Instructions

Step-by-step guide for the AI agent:

1. First, check X
2. Then, do Y
3. Finally, verify Z

## Example

Show an example input and expected output.
```

</div>

## Best Practices

| Do | Don't |
|----|-------|
| Be specific and actionable | Use vague instructions |
| Include examples | Assume context |
| Define success criteria | Leave outcomes ambiguous |
| Reference file paths | Use relative descriptions |

---
Generated by [Dewey](https://github.com/arach/dewey) | Last updated: 2026-03-03