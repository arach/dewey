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
- **Reviewing** - Skills that catch drift between docs and codebase

Dewey prepares your docs for AI consumption. Rendering is left to frameworks like Fumadocs, Docusaurus, or your own setup.

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
dewey agent     Score agent-readiness (0-100)
```

## Quick Links

- [Quickstart](./quickstart.md) - Get started in 5 minutes
- [CLI Reference](./cli.md) - All commands and options
- [Skills](./skills.md) - Built-in LLM prompt templates

## Quickstart

> Get started with Dewey in 5 minutes

# Quickstart

Get your documentation agent-ready in under 5 minutes.

## Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm

## Installation

```bash
pnpm add -D @arach/dewey
```

## Initialize

```bash
npx dewey init
```

This creates:
- `docs/` folder with starter templates
- `dewey.config.ts` configuration file

## Configure

Edit `dewey.config.ts` with your project context:

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

## Write Documentation

Create docs in the `docs/` folder:

```
docs/
  overview.md      # Project introduction
  quickstart.md    # Getting started guide
  api.md           # API reference
  overview.agent.md  # Agent-optimized version
```

## Generate Agent Files

```bash
npx dewey generate
```

Outputs:
- `AGENTS.md` - Combined context for AI agents
- `llms.txt` - Plain text summary for LLMs
- `docs.json` - Structured documentation
- `install.md` - LLM-executable installation guide

## Check Your Score

```bash
npx dewey agent
```

```
Agent Readiness Report
Overall Score: 75/100 (Grade: C)

Categories:
✓ Project Context: 20/25
○ Agent-Optimized Files: 20/30
...
```

## Next Steps

- Create `.agent.md` versions of your docs
- Add skills to `.claude/skills/` for custom reviews
- Run `dewey audit` to check completeness

## Skills

> Built-in LLM prompt templates

# Skills

Skills are LLM prompts that guide AI agents through specific tasks. They're not code - they're expert instructions.

## Built-in Skills

### docsReviewAgent

Reviews documentation quality page-by-page. Catches:
- Stale content that doesn't match code
- Missing sections
- Unclear explanations
- Broken links

**Usage:**
```
Use the docsReviewAgent skill to review docs/overview.md
```

### promptSlideoutGenerator

Generates AI-consumable prompt configurations for documentation pages.

**Usage:**
```
Use promptSlideoutGenerator to create prompt config for the API page
```

### installMdGenerator

Creates install.md files following the [installmd.org](https://installmd.org) specification.

**Usage:**
```
Use installMdGenerator to create install.md from dewey.config.ts
```

## Creating Custom Skills

Skills live in `.claude/skills/` as markdown files:

```
.claude/skills/
  my-skill.md
```

### Skill Structure

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

## Skill Best Practices

| Do | Don't |
|----|-------|
| Be specific and actionable | Use vague instructions |
| Include examples | Assume context |
| Define success criteria | Leave outcomes ambiguous |
| Reference file paths | Use relative descriptions |

---
Generated by [Dewey](https://github.com/arach/dewey) | Last updated: 2026-01-22