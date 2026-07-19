---
title: Quickstart
description: Get your documentation agent-ready in under 5 minutes
order: 2
---

Requires Node.js 18+ and Bun 1.3+ (recommended) or npm.

## Onboarding sequence

One path from empty docs to agent-ready artifacts. Optional steps are marked.

| Step | Command / action | What you get |
|------|------------------|--------------|
| 1. Install | `bun add -d @arach/dewey` | Local CLI |
| 2. Init | `bunx dewey init` | `docs/` + `dewey.config.ts` |
| 3. Configure | Edit `dewey.config.ts` | Project context, agent rules, install steps |
| 4. Author | Write `.md` and `.agent.md` | Human + agent source pages |
| 5. Generate | `bunx dewey generate` | `AGENTS.md`, `llms.txt`, `docs.json`, `install.md`, `agent/` |
| 6. Audit | `bunx dewey audit` | Deterministic completeness checks |
| 7. Score | `bunx dewey agent` | Agent-readiness score (0–100) and recommendations |
| 8a. Embed (optional) | Components in your React/Next app | Human UI on an **existing** site — [integration guide](./integrate-existing-site.md) |
| 8b. Create (optional) | `bunx dewey create my-docs --source ./docs --theme ocean` | **Standalone** static docs site |

Core contract is steps 1–7 (especially **generate**). Publishing a site is optional.

### 1. Install

```bash
bun add -d @arach/dewey
```

When you will import React components into an app, install as a runtime dependency instead: `bun add @arach/dewey`. See [Integrate into an existing site](./integrate-existing-site.md).

### 2. Initialize

```bash
bunx dewey init
```

Creates a `docs/` folder with starter templates and a `dewey.config.ts` configuration file.

Choose a project type so the scaffold and later evidence checks match the product:

```bash
bunx dewey init --type npm-package
# generic | npm-package | cli-tool | react-library | macos-app | monorepo
```

Every type creates paired human and agent pages. The focus page and defaults vary: API for npm packages, command reference for CLIs, component reference for React libraries, architecture for generic/macOS projects, and workspace mapping for monorepos. An invalid type fails instead of silently using `generic`.

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
      { description: 'Install', command: 'bun add your-project' },
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
  overview.agent.md    # Agent-optimized version (or docs/agent/overview.agent.md)
```

### 5. Generate agent files

```bash
bunx dewey generate
```

Outputs `AGENTS.md`, `llms.txt`, `docs.json`, `install.md`, and an `agent/` retrieval surface with raw markdown, prompt registries, manifests, and context bundles.

The same canonical document discovery powers `generate`, the optional `create` scaffold, and the artifact API. Full content is materialized deliberately: document bodies in `agent/docs.json`, prompts in `agent/prompts.json`, and Markdown in `agent/raw/docs/` plus bundles. Context files remain compact retrieval indexes.

### 6. Audit

```bash
bunx dewey audit
# CI-friendly:
bunx dewey audit --json
```

Structural and completeness checks plus project-type evidence and focused documentation drift. JSON output includes structured `projectType` and `drift` objects. Prefer fixing audit findings before treating the score as a release gate.

### 7. Check your score

<div class="doc-file-block">
<div class="doc-file-bar">bunx dewey agent</div>

```
Agent Readiness Report
Overall Score: 75/100 (Grade: C)

Categories:
✓ Project Context: 20/25
○ Agent-Optimized Files: 20/30
...
```

</div>

```bash
bunx dewey agent --json   # machine-readable for CI
```

### 8. Optional: human-facing docs UI

**Already have a React or Next.js site?** Embed Dewey components under a `/docs` route:

→ [Integrate into an existing site](./integrate-existing-site.md)

**Want a standalone docs site from the same Markdown?**

```bash
bunx dewey create my-docs --source ./docs --theme ocean
cd my-docs && bun install && bun run dev
```

Generates a static docs site when you want a separate publishing path alongside agent artifacts.

The scaffold pins tested Next.js/Astro dependencies and runs the same agent-artifact writer, so it starts with both a human site and the retrieval contract. For later adoption, updates, ejection, backups, and recovery, see [Maintaining generated sites](./maintenance.md).

---

## Next steps

- Create `.agent.md` versions of your docs for denser, structured content
- Add skills to `.claude/skills/` for custom agent-guided reviews
- Run `bunx dewey audit` and `bunx dewey agent` in CI (`--json`)
- Embed components or use `dewey create` only when you need a human site
- [CLI Reference](./cli.md) · [Skills](./skills.md) · [Existing-site guide](./integrate-existing-site.md)
- [Maintaining generated sites](./maintenance.md) — ownership, update, eject, recovery, and release checks
