---
title: Quickstart
description: Get your documentation agent-ready in under 5 minutes
order: 2
---

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
