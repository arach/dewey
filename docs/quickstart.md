---
title: Quickstart
description: Get started with Dewey in 5 minutes
order: 2
---

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
